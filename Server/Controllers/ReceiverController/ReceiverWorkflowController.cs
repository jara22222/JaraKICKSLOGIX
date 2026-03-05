using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Hubs.BranchManagerHub;
using Server.Models;
using Server.Utilities;
using System.Security.Claims;

namespace Server.Controllers.ReceiverController
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiverWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;
        private const int BranchAdminNotifyThreshold = 20;

        public ReceiverWorkflowController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub
        )
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [Authorize(Roles = "Receiver")]
        [HttpPost("register-received-product")]
        public async Task<ActionResult<ReceiverProductDto>> RegisterReceivedProductAsync(
            [FromBody] RegisterReceivedProductDto dto
        )
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "Receiver";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";
                var normalizedSize = dto.Size.Trim().ToUpperInvariant();
                var normalizedSku = dto.SKU.Trim().ToUpperInvariant();
                var normalizedProductName = dto.ProductName.Trim();
                var normalizedSupplierName = dto.Supplier.Trim();
                var requiredUnits = dto.Quantity;
                var selectedBinId = dto.SelectedBinId?.Trim();
                var shipmentId = dto.ShipmentId?.Trim();

                BinLocation? selectedBin = null;

                if (!string.IsNullOrWhiteSpace(selectedBinId))
                {
                    selectedBin = await _context.BinLocations.FirstOrDefaultAsync(bin =>
                        bin.BinId == selectedBinId &&
                        bin.BinStatus != "Archived" &&
                        bin.BinSize == normalizedSize &&
                        bin.Branch == branchName
                    );

                    if (selectedBin == null)
                    {
                        return BadRequest(new ApiMessageDto
                        {
                            Message = "Selected bin is invalid for this item size."
                        });
                    }

                    var selectedBinRemaining = selectedBin.BinCapacity - selectedBin.OccupiedQty;
                    if (selectedBinRemaining < requiredUnits)
                    {
                        return BadRequest(new ApiMessageDto
                        {
                            Message = $"Selected bin does not have enough capacity. Required units: {requiredUnits}, Remaining units: {Math.Max(selectedBinRemaining, 0)}."
                        });
                    }
                }
                else
                {
                    selectedBin = await _context.BinLocations
                        .Where(bin =>
                            bin.BinStatus != "Archived" &&
                            bin.BinSize == normalizedSize &&
                            bin.Branch == branchName &&
                            !_context.Inventory.Any(item =>
                                item.BinId == bin.BinId &&
                                item.IsBinAssigned &&
                                item.WorkflowStatus != "Archived" &&
                                (item.SKU != normalizedSku ||
                                 item.Size != normalizedSize ||
                                 (item.ProductName ?? string.Empty).ToUpper() != normalizedProductName.ToUpper() ||
                                 (item.SupplierName ?? string.Empty).ToUpper() != normalizedSupplierName.ToUpper())) &&
                            (bin.BinCapacity - bin.OccupiedQty) >= requiredUnits
                        )
                        .OrderBy(bin => (bin.BinCapacity - bin.OccupiedQty))
                        .FirstOrDefaultAsync();
                }

                if (selectedBin == null)
                {
                    // If no exact-capacity slot exists, still accept and assign to best available slot.
                    var fallbackBin = await _context.BinLocations
                        .Where(bin =>
                            bin.BinStatus != "Archived" &&
                            bin.BinSize == normalizedSize &&
                            bin.Branch == branchName &&
                            !_context.Inventory.Any(item =>
                                item.BinId == bin.BinId &&
                                item.IsBinAssigned &&
                                item.WorkflowStatus != "Archived" &&
                                (item.SKU != normalizedSku ||
                                 item.Size != normalizedSize ||
                                 (item.ProductName ?? string.Empty).ToUpper() != normalizedProductName.ToUpper() ||
                                 (item.SupplierName ?? string.Empty).ToUpper() != normalizedSupplierName.ToUpper())) &&
                            (bin.BinCapacity - bin.OccupiedQty) > 0
                        )
                        .OrderByDescending(bin => (bin.BinCapacity - bin.OccupiedQty))
                        .FirstOrDefaultAsync();

                    if (fallbackBin == null)
                    {
                        return BadRequest(new ApiMessageDto
                        {
                            Message = $"No available bin found for size {normalizedSize}."
                        });
                    }

                    selectedBin = fallbackBin;
                }

                var hasConflictingProductInSelectedBin = await _context.Inventory.AnyAsync(item =>
                    item.BinId == selectedBin.BinId &&
                    item.IsBinAssigned &&
                    item.WorkflowStatus != "Archived" &&
                    item.ProductId != shipmentId &&
                    (item.SKU != normalizedSku ||
                     item.Size != normalizedSize ||
                     (item.ProductName ?? string.Empty).ToUpper() != normalizedProductName.ToUpper() ||
                     (item.SupplierName ?? string.Empty).ToUpper() != normalizedSupplierName.ToUpper()));
                if (hasConflictingProductInSelectedBin)
                {
                    return BadRequest(new ApiMessageDto
                    {
                        Message = "Selected bin already contains a different SKU, product name, supplier, or size. Please choose another bin."
                    });
                }

                var existingShipment = string.IsNullOrWhiteSpace(shipmentId)
                    ? null
                    : await _context.Inventory.FirstOrDefaultAsync(item =>
                        item.ProductId == shipmentId &&
                        item.Branch == branchName &&
                        item.WorkflowStatus == "PendingReceive"
                    );

                var mergeTarget = await _context.Inventory
                    .Where(item =>
                        item.ProductId != shipmentId &&
                        item.IsBinAssigned &&
                        item.BinId == selectedBin.BinId &&
                        item.SKU == normalizedSku &&
                        item.Size == normalizedSize &&
                        (item.ProductName ?? string.Empty).ToUpper() == normalizedProductName.ToUpper() &&
                        (item.SupplierName ?? string.Empty).ToUpper() == normalizedSupplierName.ToUpper() &&
                        item.WorkflowStatus != "Archived")
                    .OrderByDescending(item => item.UpdatedAt ?? item.DateReceived)
                    .FirstOrDefaultAsync();

                var product = existingShipment ?? new Inventory
                {
                    ProductId = IdGenerator.Create("PRD"),
                    SupplierId = currentUserId ?? string.Empty,
                    DateReceived = DateTime.UtcNow
                };

                if (mergeTarget != null)
                {
                    mergeTarget.QuantityOnHand += dto.Quantity;
                    mergeTarget.ItemQty = mergeTarget.QuantityOnHand.ToString();
                    mergeTarget.UpdatedAt = DateTime.UtcNow;

                    if (existingShipment != null)
                    {
                        // Remove pending shipment row once merged into an existing batch record.
                        _context.Inventory.Remove(existingShipment);
                    }

                    product = mergeTarget;
                }
                else
                {
                    product.SupplierName = normalizedSupplierName;
                    product.ProductName = normalizedProductName;
                    product.ItemQty = dto.Quantity.ToString();
                    product.QuantityOnHand = dto.Quantity;
                    product.SKU = normalizedSku;
                    product.Size = normalizedSize;
                }
                product.QrString = string.IsNullOrWhiteSpace(product.QrString)
                    ? $"PRODUCT:{normalizedSku}:{IdGenerator.RandomBase36(10)}"
                    : product.QrString;
                product.CriticalThreshold = GetThresholdBySize(normalizedSize);
                product.WorkflowStatus = "PendingPutAway";
                product.Branch = branchName;
                product.BinId = selectedBin.BinId;
                product.IsBinAssigned = true;
                product.UpdatedAt = DateTime.UtcNow;

                selectedBin.OccupiedQty += requiredUnits;
                selectedBin.IsAvailable = selectedBin.OccupiedQty < selectedBin.BinCapacity;
                selectedBin.BinStatus = selectedBin.OccupiedQty > 0 ? "Occupied" : "Available";
                selectedBin.UpdatedAt = DateTime.UtcNow;

                if (existingShipment == null && mergeTarget == null)
                {
                    _context.Inventory.Add(product);
                }
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.ProductId,
                    BinId = selectedBin.BinId,
                    Branch = branchName,
                    Action = "Receive",
                    ToStatus = "PendingPutAway",
                    Quantity = dto.Quantity,
                    PerformedByUserId = currentUserId ?? "N/A",
                    PerformedBy = currentUserName,
                    Description =
                        $"{currentUserName} received {dto.Quantity} units of {normalizedSku} and assigned bin {selectedBin.BinLocationCode}.",
                    OccurredAt = DateTime.UtcNow
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Receive",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =
                        $"{currentUserName} registered received product {normalizedSku} ({dto.Quantity}) to bin {selectedBin.BinLocationCode}.",
                    DatePerformed = DateTime.UtcNow
                });

                if (dto.Quantity > BranchAdminNotifyThreshold)
                {
                    await CreateHighQuantityNotificationAsync(
                        branchName,
                        normalizedSize,
                        normalizedSku,
                        dto.Quantity,
                        selectedBin.BinLocationCode
                    );
                }

                await _context.SaveChangesAsync();

                await _notificationHub.SendToBranchAndSuperAdminAsync(branchName, "PutAwayTaskUpdated", new
                {
                    productId = product.ProductId,
                    sku = normalizedSku,
                    size = normalizedSize,
                    quantity = dto.Quantity,
                    branch = branchName,
                    binId = selectedBin.BinId,
                    binLocation = selectedBin.BinLocationCode,
                    fromStatus = existingShipment?.WorkflowStatus ?? "PendingReceive",
                    toStatus = "PendingPutAway",
                    performedBy = currentUserName,
                    updatedAt = DateTime.UtcNow
                });

                return Ok(new ReceiverProductDto
                {
                    ProductId = product.ProductId,
                    ProductName = dto.ProductName,
                    Supplier = dto.Supplier,
                    SKU = normalizedSku,
                    Size = normalizedSize,
                    Quantity = dto.Quantity,
                    WorkflowStatus = product.WorkflowStatus,
                    BinId = selectedBin.BinId,
                    BinLocation = selectedBin.BinLocationCode,
                    ReceivedAt = product.DateReceived
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}"
                });
            }
        }

        [Authorize(Roles = "Receiver")]
        [HttpGet("my-logs")]
        public async Task<ActionResult<List<ReceiverLogDto>>> GetMyLogsAsync()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var logs = await _context.StockMovements
                    .Where(movement => movement.PerformedByUserId == currentUserId)
                    .OrderByDescending(movement => movement.OccurredAt)
                    .Select(movement => new ReceiverLogDto
                    {
                        MovementId = movement.MovementId,
                        Action = movement.Action,
                        Description = movement.Description,
                        Quantity = movement.Quantity,
                        ProductId = movement.ProductId,
                        BinId = movement.BinId,
                        OccurredAt = movement.OccurredAt
                    })
                    .ToListAsync();

                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}"
                });
            }
        }

        [Authorize(Roles = "Receiver,PutAway")]
        [HttpGet("assigned-items")]
        public async Task<ActionResult<List<ReceiverAssignedItemDto>>> GetAssignedItemsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<ReceiverAssignedItemDto>());
            }

            var items = await _context.Inventory
                .Where(item =>
                    item.IsBinAssigned &&
                    !string.IsNullOrWhiteSpace(item.BinId) &&
                    item.Branch == currentBranch)
                .Join(
                    _context.BinLocations,
                    item => item.BinId,
                    bin => bin.BinId,
                    (item, bin) => new ReceiverAssignedItemDto
                    {
                        ProductId = item.ProductId,
                        ProductName = item.ProductName,
                        SupplierName = item.SupplierName,
                        SKU = item.SKU,
                        Size = item.Size,
                        Quantity = item.QuantityOnHand,
                        WorkflowStatus = item.WorkflowStatus,
                        BinId = bin.BinId,
                        BinLocation = bin.BinLocationCode,
                        ItemQrString = item.QrString,
                        AssignedAt = item.DateReceived
                    }
                )
                .OrderByDescending(item => item.AssignedAt)
                .Take(200)
                .ToListAsync();

            return Ok(items);
        }

        [Authorize(Roles = "Receiver,PutAway")]
        [HttpGet("incoming-shipments")]
        public async Task<ActionResult<List<InboundIncomingShipmentDto>>> GetIncomingShipmentsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<InboundIncomingShipmentDto>());
            }

            var incoming = await _context.Inventory
                .Where(item =>
                    item.WorkflowStatus == "PendingReceive" &&
                    item.Branch == currentBranch)
                .OrderByDescending(item => item.DateReceived)
                .Select(item => new InboundIncomingShipmentDto
                {
                    Id = item.ProductId,
                    PoRef = $"PO-{item.ProductId.Substring(0, 8).ToUpper()}",
                    Supplier = string.IsNullOrWhiteSpace(item.SupplierName) ? "Unknown Supplier" : item.SupplierName,
                    Product = string.IsNullOrWhiteSpace(item.ProductName) ? item.SKU : item.ProductName,
                    SKU = item.SKU,
                    Size = item.Size,
                    Qty = item.QuantityOnHand,
                    DateSent = item.DateReceived.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    Eta = item.DateReceived.AddDays(2).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    Status = "Arrived"
                })
                .Take(300)
                .ToListAsync();

            return Ok(incoming);
        }

        [Authorize(Roles = "Receiver,PutAway,BranchManager")]
        [HttpGet("receipts")]
        public async Task<ActionResult<List<InboundReceiptDto>>> GetReceiptsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<InboundReceiptDto>());
            }

            var products = await _context.Inventory
                .Where(item => item.IsBinAssigned && item.Branch == currentBranch)
                .OrderByDescending(item => item.DateReceived)
                .Take(300)
                .ToListAsync();

            var productIds = products.Select(product => product.ProductId).ToHashSet();
            var binIds = products
                .Where(product => !string.IsNullOrWhiteSpace(product.BinId))
                .Select(product => product.BinId!)
                .ToHashSet();

            var bins = await _context.BinLocations
                .Where(bin => binIds.Contains(bin.BinId))
                .ToDictionaryAsync(bin => bin.BinId, bin => bin);

            var movements = await _context.StockMovements
                .Where(movement => movement.ProductId != null && productIds.Contains(movement.ProductId))
                .OrderByDescending(movement => movement.OccurredAt)
                .ToListAsync();

            var receipts = products.Select(product =>
            {
                var productMovements = movements.Where(movement => movement.ProductId == product.ProductId).ToList();
                var receiveMovement = productMovements.FirstOrDefault(movement =>
                    movement.Action == "Receive" || movement.Action == "SupplierSubmit");
                var putAwayMovement = productMovements.FirstOrDefault(movement =>
                    movement.Action == "StoreInBin" || movement.Action == "ScanItem" || movement.Action == "ScanBin");
                var bin = (product.BinId != null && bins.TryGetValue(product.BinId, out var foundBin)) ? foundBin : null;

                return new InboundReceiptDto
                {
                    Id = $"RCPT-{product.ProductId.Substring(0, 8).ToUpper()}",
                    PoRef = $"PO-{product.ProductId.Substring(0, 8).ToUpper()}",
                    Product = string.IsNullOrWhiteSpace(product.ProductName) ? product.SKU : product.ProductName,
                    SKU = product.SKU,
                    Qty = product.QuantityOnHand,
                    ReceivedBy = new InboundPersonInfoDto
                    {
                        Name = receiveMovement?.PerformedBy ?? "System",
                        Role = "Receiver",
                        Time = (receiveMovement?.OccurredAt ?? product.DateReceived).ToString("yyyy-MM-ddTHH:mm:ssZ")
                    },
                    PutawayBy = new InboundPersonInfoDto
                    {
                        Name = putAwayMovement?.PerformedBy ?? "Pending",
                        Role = putAwayMovement == null ? "-" : "PutAway",
                        Time = putAwayMovement?.OccurredAt.ToString("yyyy-MM-ddTHH:mm:ssZ") ?? "-"
                    },
                    Location = new InboundLocationInfoDto
                    {
                        Type = bin == null ? "Staging" : "Fixed-Bin",
                        Id = bin?.BinLocationCode ?? "Pending"
                    },
                    Status = product.WorkflowStatus
                };
            }).ToList();

            return Ok(receipts);
        }

        [Authorize(Roles = "Receiver,PutAway")]
        [HttpGet("kpis")]
        public async Task<ActionResult<InboundKpiDto>> GetInboundKpisAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                return Unauthorized(new ApiMessageDto
                {
                    Message = "User identity is missing."
                });
            }
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new InboundKpiDto());
            }

            var now = DateTime.UtcNow;
            var todayUtc = now.Date;
            var tomorrowUtc = todayUtc.AddDays(1);

            var pendingStatuses = new[] { "PendingReceive", "PendingAdminApproval" };
            var inTransitStatuses = new[] { "InTransit", "In Transit" };

            var pendingAcceptanceCount = await _context.Inventory
                .Where(item =>
                    pendingStatuses.Contains(item.WorkflowStatus) &&
                    item.Branch == currentBranch)
                .CountAsync();

            var totalUnitsIncoming = await _context.Inventory
                .Where(item =>
                    pendingStatuses.Contains(item.WorkflowStatus) &&
                    item.Branch == currentBranch)
                .SumAsync(item => (int?)item.QuantityOnHand) ?? 0;

            var inTransitCount = await _context.Inventory
                .Where(item =>
                    inTransitStatuses.Contains(item.WorkflowStatus) &&
                    item.Branch == currentBranch)
                .CountAsync();

            var storedTodayCount = await _context.StockMovements
                .Where(movement =>
                    movement.Action == "StoreInBin" &&
                    movement.Branch == currentBranch &&
                    movement.OccurredAt >= todayUtc &&
                    movement.OccurredAt < tomorrowUtc)
                .CountAsync();

            var actionsTodayCount = await _context.StockMovements
                .Where(movement =>
                    movement.PerformedByUserId == currentUserId &&
                    movement.Branch == currentBranch &&
                    movement.OccurredAt >= todayUtc &&
                    movement.OccurredAt < tomorrowUtc)
                .CountAsync();

            return Ok(new InboundKpiDto
            {
                PendingAcceptanceCount = pendingAcceptanceCount,
                InTransitCount = inTransitCount,
                StoredTodayCount = storedTodayCount,
                ActionsTodayCount = actionsTodayCount,
                TotalUnitsIncoming = totalUnitsIncoming
            });
        }

        [Authorize(Roles = "Receiver,PutAway")]
        [HttpGet("activity-log")]
        public async Task<ActionResult<List<InboundActivityDto>>> GetActivityLogAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                return Unauthorized(new ApiMessageDto
                {
                    Message = "User identity is missing."
                });
            }

            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            if (currentUser == null)
            {
                return Unauthorized(new ApiMessageDto
                {
                    Message = "User account not found."
                });
            }

            var roleNames = await _context.UserRoles
                .Join(_context.Roles, userRole => userRole.RoleId, role => role.Id, (userRole, role) => new { userRole.UserId, role.Name })
                .Where(item => item.UserId == currentUserId)
                .Select(item => item.Name)
                .ToListAsync();

            var isPutAway = roleNames.Contains("PutAway");
            var isReceiver = roleNames.Contains("Receiver");
            if (!isPutAway && !isReceiver)
            {
                return Forbid();
            }

            var targetRoleName = isPutAway ? "PutAway" : "Receiver";
            var allowedActions = isPutAway
                ? new[] { "ClaimPutAway", "ScanItem", "ScanBin", "StoreInBin" }
                : new[] { "Receive" };

            var targetRoleId = await _context.Roles
                .Where(role => role.Name == targetRoleName)
                .Select(role => role.Id)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(targetRoleId))
            {
                return Ok(new List<InboundActivityDto>());
            }

            var scopedUserIds = await _context.UserRoles
                .Where(userRole => userRole.RoleId == targetRoleId)
                .Select(userRole => userRole.UserId)
                .Distinct()
                .ToListAsync();

            if (scopedUserIds.Count == 0)
            {
                return Ok(new List<InboundActivityDto>());
            }

            var currentBranch = currentUser.Branch ?? string.Empty;
            var activity = await _context.StockMovements
                .Where(movement =>
                    !string.IsNullOrWhiteSpace(movement.PerformedByUserId) &&
                    scopedUserIds.Contains(movement.PerformedByUserId) &&
                    allowedActions.Contains(movement.Action) &&
                    (string.IsNullOrWhiteSpace(currentBranch) || movement.Branch == currentBranch))
                .OrderByDescending(movement => movement.OccurredAt)
                .Take(500)
                .Select(movement => new InboundActivityDto
                {
                    Id = movement.MovementId,
                    User = string.IsNullOrWhiteSpace(movement.PerformedBy) ? "System" : movement.PerformedBy,
                    Action = movement.Action,
                    Description = movement.Description,
                    Timestamp = movement.OccurredAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                })
                .ToListAsync();

            return Ok(activity);
        }

        private static int GetThresholdBySize(string size)
        {
            // Global threshold for inventory alerts.
            return BranchAdminNotifyThreshold;
        }

        private async Task CreateHighQuantityNotificationAsync(
            string branch,
            string size,
            string sku,
            int quantity,
            string binLocation
        )
        {
            var branchManagers = await _context.Users
                .Where(user => user.Branch == branch)
                .ToListAsync();

            foreach (var manager in branchManagers)
            {
                var roles = await _context.UserRoles
                    .Join(_context.Roles, ur => ur.RoleId, role => role.Id, (ur, role) => new { ur.UserId, role.Name })
                    .Where(item => item.UserId == manager.Id)
                    .Select(item => item.Name)
                    .ToListAsync();

                if (!roles.Contains("BranchManager"))
                {
                    continue;
                }

                _context.BranchNotifications.Add(new BranchNotification
                {
                    NotificationId = IdGenerator.Create("NTF"),
                    Branch = branch,
                    RecipientUserId = manager.Id,
                    Type = "HighQuantityReceive",
                    Size = size,
                    Message = $"High quantity received: {sku} ({size}) qty {quantity} assigned to {binLocation}. Threshold: {BranchAdminNotifyThreshold}.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
    }
}
