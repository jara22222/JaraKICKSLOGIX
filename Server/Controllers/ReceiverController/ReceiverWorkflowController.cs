using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers.ReceiverController
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiverWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private const int BranchAdminNotifyThreshold = 20;

        public ReceiverWorkflowController(ApplicationDbContext context)
        {
            _context = context;
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
                var selectedBinId = dto.SelectedBinId?.Trim();

                BinLocation? selectedBin = null;

                if (!string.IsNullOrWhiteSpace(selectedBinId))
                {
                    selectedBin = await _context.BinLocations.FirstOrDefaultAsync(bin =>
                        bin.BinId == selectedBinId &&
                        bin.BinStatus != "Archived" &&
                        bin.BinSize == normalizedSize
                    );

                    if (selectedBin == null)
                    {
                        return BadRequest(new ApiMessageDto
                        {
                            Message = "Selected bin is invalid for this item size."
                        });
                    }
                }
                else
                {
                    selectedBin = await _context.BinLocations
                        .Where(bin =>
                            bin.BinStatus != "Archived" &&
                            bin.BinSize == normalizedSize &&
                            (bin.BinCapacity - bin.OccupiedQty) >= dto.Quantity
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

                var newProduct = new Inventory
                {
                    ProductId = Guid.NewGuid().ToString(),
                    SupplierId = currentUserId ?? string.Empty,
                    SupplierName = dto.Supplier.Trim(),
                    ProductName = dto.ProductName.Trim(),
                    ItemQty = dto.Quantity.ToString(),
                    QuantityOnHand = dto.Quantity,
                    SKU = dto.SKU.Trim(),
                    Size = normalizedSize,
                    QrString = $"PRODUCT:{dto.SKU.Trim()}:{Guid.NewGuid()}",
                    CriticalThreshold = GetThresholdBySize(normalizedSize),
                    WorkflowStatus = "PendingPutAway",
                    BinId = selectedBin.BinId,
                    IsBinAssigned = true,
                    DateReceived = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                selectedBin.OccupiedQty += dto.Quantity;
                selectedBin.IsAvailable = selectedBin.OccupiedQty < selectedBin.BinCapacity;
                selectedBin.BinStatus = selectedBin.IsAvailable ? "Available" : "Occupied";
                selectedBin.UpdatedAt = DateTime.UtcNow;

                _context.Inventory.Add(newProduct);
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = newProduct.ProductId,
                    BinId = selectedBin.BinId,
                    Branch = branchName,
                    Action = "Receive",
                    ToStatus = "PendingPutAway",
                    Quantity = dto.Quantity,
                    PerformedByUserId = currentUserId ?? "N/A",
                    PerformedBy = currentUserName,
                    Description =
                        $"{currentUserName} received {dto.Quantity} units of {dto.SKU} and assigned bin {selectedBin.BinLocationCode}.",
                    OccurredAt = DateTime.UtcNow
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Receive",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =
                        $"{currentUserName} registered received product {dto.SKU} ({dto.Quantity}) to bin {selectedBin.BinLocationCode}.",
                    DatePerformed = DateTime.UtcNow
                });

                if (dto.Quantity > BranchAdminNotifyThreshold)
                {
                    await CreateHighQuantityNotificationAsync(
                        branchName,
                        normalizedSize,
                        dto.SKU,
                        dto.Quantity,
                        selectedBin.BinLocationCode
                    );
                }

                await _context.SaveChangesAsync();

                return Ok(new ReceiverProductDto
                {
                    ProductId = newProduct.ProductId,
                    ProductName = dto.ProductName,
                    Supplier = dto.Supplier,
                    SKU = dto.SKU,
                    Size = normalizedSize,
                    Quantity = dto.Quantity,
                    WorkflowStatus = newProduct.WorkflowStatus,
                    BinId = selectedBin.BinId,
                    BinLocation = selectedBin.BinLocationCode,
                    ReceivedAt = newProduct.DateReceived
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
            var items = await _context.Inventory
                .Where(item => item.IsBinAssigned && !string.IsNullOrWhiteSpace(item.BinId))
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
            var incoming = await _context.Inventory
                .Where(item => item.WorkflowStatus == "PendingReceive")
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
            var products = await _context.Inventory
                .Where(item => item.IsBinAssigned)
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
        [HttpGet("activity-log")]
        public async Task<ActionResult<List<InboundActivityDto>>> GetActivityLogAsync()
        {
            var activity = await _context.StockMovements
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
                    NotificationId = Guid.NewGuid().ToString(),
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
