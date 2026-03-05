using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Hubs.BranchManagerHub;
using Server.Models;
using Server.Utilities;
using System.Security.Claims;

namespace Server.Controllers.DispatchController
{
    [ApiController]
    [Route("api/[controller]")]
    public class DispatchWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;

        public DispatchWorkflowController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub
        )
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpGet("approved-orders")]
        public async Task<ActionResult<List<DispatchOrderDto>>> GetApprovedOrdersAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<DispatchOrderDto>());
            }

            var orders = await _context.Orders
                .Where(order =>
                    order.Branch == currentBranch &&
                    (order.Status == "Approved" ||
                    order.Status == "DispatchClaimed" ||
                    order.Status == "ItemScanned"))
                .OrderByDescending(order => order.CreatedAt)
                .Select(order => new DispatchOrderDto
                {
                    OrderId = order.OrderId,
                    SKU = order.SKU,
                    Size = order.Size,
                    BinLocation = _context.Inventory
                        .Where(item =>
                            item.SKU == order.SKU &&
                            item.Size == order.Size &&
                            item.Branch == order.Branch &&
                            item.QuantityOnHand > 0 &&
                            !string.IsNullOrWhiteSpace(item.BinId))
                        .OrderBy(item => item.DateReceived)
                        .Select(item => _context.BinLocations
                            .Where(bin => bin.BinId == item.BinId)
                            .Select(bin => bin.BinLocationCode)
                            .FirstOrDefault() ?? "Unassigned")
                        .FirstOrDefault() ?? "Unassigned",
                    Quantity = order.Quantity,
                    Status = order.Status,
                    CustomerName = order.CustomerName,
                    CustomerAddress = order.CustomerAddress,
                    CourierId = order.CourierId,
                    CreatedAt = order.CreatedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpGet("activity-log")]
        public async Task<ActionResult<List<DispatchActivityDto>>> GetActivityLogAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                return Unauthorized(new ApiMessageDto { Message = "User identity is missing." });
            }

            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            if (currentUser == null)
            {
                return Unauthorized(new ApiMessageDto { Message = "User account not found." });
            }

            var dispatchRoleId = await _context.Roles
                .Where(role => role.Name == "DispatchClerk")
                .Select(role => role.Id)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(dispatchRoleId))
            {
                return Ok(new List<DispatchActivityDto>());
            }

            var dispatchUserIds = await _context.UserRoles
                .Where(userRole => userRole.RoleId == dispatchRoleId)
                .Select(userRole => userRole.UserId)
                .Distinct()
                .ToListAsync();

            if (dispatchUserIds.Count == 0)
            {
                return Ok(new List<DispatchActivityDto>());
            }

            var currentBranch = currentUser.Branch ?? string.Empty;
            var allowedActions = new[] { "DispatchToVAS", "Dispatch" };
            var logs = await _context.StockMovements
                .Where(movement =>
                    !string.IsNullOrWhiteSpace(movement.PerformedByUserId) &&
                    dispatchUserIds.Contains(movement.PerformedByUserId) &&
                    allowedActions.Contains(movement.Action) &&
                    (string.IsNullOrWhiteSpace(currentBranch) || movement.Branch == currentBranch))
                .OrderByDescending(movement => movement.OccurredAt)
                .Take(500)
                .Select(movement => new DispatchActivityDto
                {
                    Id = movement.MovementId,
                    User = string.IsNullOrWhiteSpace(movement.PerformedBy) ? "System" : movement.PerformedBy,
                    Action = movement.Action,
                    Description = movement.Description,
                    Timestamp = movement.OccurredAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                })
                .ToListAsync();

            return Ok(logs);
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpPut("claim/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ClaimAsync(string orderId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }
            if (string.IsNullOrWhiteSpace(currentBranch) ||
                !string.Equals(order.Branch, currentBranch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (order.Status != "Approved")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not available for dispatch claim." });
            }

            order.Status = "DispatchClaimed";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await BroadcastOutboundQueueUpdatedAsync(order);
            return Ok(new ApiMessageDto { Message = "Dispatch task claimed. Proceed to item scan." });
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpPut("scan-item/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanItemAsync(string orderId, [FromBody] QrScanDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var branch = currentUser?.Branch ?? string.Empty;
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }
            if (string.IsNullOrWhiteSpace(branch) ||
                !string.Equals(order.Branch, branch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (order.Status != "DispatchClaimed")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not ready for item scan." });
            }

            var scannedValue = dto.QrValue?.Trim() ?? string.Empty;
            var requiredSku = order.SKU.Trim();
            var requiredSize = order.Size.Trim();
            var hasSku = scannedValue.Contains(requiredSku, StringComparison.OrdinalIgnoreCase);
            var hasSize = scannedValue.Contains(requiredSize, StringComparison.OrdinalIgnoreCase);
            if (!(hasSku && hasSize))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned item does not match order SKU/Size." });
            }

            var product = await _context.Inventory
                .Where(item =>
                    item.SKU == order.SKU &&
                    item.Size == order.Size &&
                    item.Branch == branch &&
                    item.QuantityOnHand > 0)
                .OrderBy(item => item.DateReceived)
                .FirstOrDefaultAsync();

            if (product == null || product.QuantityOnHand < order.Quantity)
            {
                return BadRequest(new ApiMessageDto { Message = "Insufficient inventory quantity for this order." });
            }

            var previousQty = product.QuantityOnHand;
            product.QuantityOnHand -= order.Quantity;
            product.ItemQty = product.QuantityOnHand.ToString();
            product.UpdatedAt = DateTime.UtcNow;
            await ReleaseBinSlotsIfNeededAsync(product, previousQty, product.QuantityOnHand);

            order.Status = "ToVAS";
            order.UpdatedAt = DateTime.UtcNow;

            var userName = User.Identity?.Name ?? "DispatchClerk";
            var branchLabel = string.IsNullOrWhiteSpace(branch) ? "N/A" : branch;

            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.ProductId,
                OrderId = order.OrderId,
                BinId = product.BinId,
                Branch = branchLabel,
                Action = "DispatchToVAS",
                FromStatus = "DispatchClaimed",
                ToStatus = "ToVAS",
                Quantity = order.Quantity,
                PerformedByUserId = userId ?? "N/A",
                PerformedBy = userName,
                Description = $"{userName} verified item QR and dispatched qty {order.Quantity} for order {order.OrderId} to VAS.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId ?? "N/A",
                Action = "Dispatch",
                Branch = branchLabel,
                PerformedBy = userName,
                Description = $"{userName} auto-deducted qty {order.Quantity} for order {order.OrderId} after item QR verification.",
                DatePerformed = DateTime.UtcNow
            });

            await PushLowStockNotificationIfNeeded(product, branchLabel);
            await _context.SaveChangesAsync();
            await BroadcastOutboundQueueUpdatedAsync(order);
            await _notificationHub.SendToBranchAndSuperAdminAsync(order.Branch, "VASQueueUpdated", new
            {
                orderId = order.OrderId,
                branch = branchLabel,
                status = order.Status,
                updatedAt = order.UpdatedAt ?? DateTime.UtcNow
            });
            return Ok(new ApiMessageDto
            {
                Message = "Item QR verified. Ordered quantity deducted and transferred to VAS."
            });
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpPut("confirm-quantity/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ConfirmQuantityAsync(
            string orderId,
            [FromBody] ConfirmDispatchQtyDto dto
        )
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var branch = currentUser?.Branch ?? string.Empty;
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }
            if (string.IsNullOrWhiteSpace(branch) ||
                !string.Equals(order.Branch, branch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (order.Status != "ItemScanned")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not ready for quantity confirmation." });
            }

            if (dto.Quantity > order.Quantity)
            {
                return BadRequest(new ApiMessageDto { Message = "Confirmed quantity exceeds order quantity." });
            }

            var product = await _context.Inventory
                .Where(item =>
                    item.SKU == order.SKU &&
                    item.Size == order.Size &&
                    item.Branch == branch &&
                    item.QuantityOnHand > 0)
                .OrderBy(item => item.DateReceived)
                .FirstOrDefaultAsync();

            if (product == null || product.QuantityOnHand < dto.Quantity)
            {
                return BadRequest(new ApiMessageDto { Message = "Insufficient inventory quantity for this order." });
            }

            var previousQty = product.QuantityOnHand;
            product.QuantityOnHand -= dto.Quantity;
            product.ItemQty = product.QuantityOnHand.ToString();
            product.UpdatedAt = DateTime.UtcNow;
            await ReleaseBinSlotsIfNeededAsync(product, previousQty, product.QuantityOnHand);

            order.Quantity = dto.Quantity;
            order.Status = "ToVAS";
            order.UpdatedAt = DateTime.UtcNow;

            var userName = User.Identity?.Name ?? "DispatchClerk";
            var branchLabel = string.IsNullOrWhiteSpace(branch) ? "N/A" : branch;

            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.ProductId,
                OrderId = order.OrderId,
                BinId = product.BinId,
                Branch = branchLabel,
                Action = "DispatchToVAS",
                FromStatus = "ItemScanned",
                ToStatus = "ToVAS",
                Quantity = dto.Quantity,
                PerformedByUserId = userId ?? "N/A",
                PerformedBy = userName,
                Description = $"{userName} confirmed qty {dto.Quantity} for order {order.OrderId} and transferred to VAS.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId ?? "N/A",
                Action = "Dispatch",
                Branch = branchLabel,
                PerformedBy = userName,
                Description = $"{userName} dispatched order {order.OrderId} to VAS with qty {dto.Quantity}.",
                DatePerformed = DateTime.UtcNow
            });

            await PushLowStockNotificationIfNeeded(product, branchLabel);
            await _context.SaveChangesAsync();
            await BroadcastOutboundQueueUpdatedAsync(order);
            await _notificationHub.SendToBranchAndSuperAdminAsync(order.Branch, "VASQueueUpdated", new
            {
                orderId = order.OrderId,
                branch = branchLabel,
                status = order.Status,
                updatedAt = order.UpdatedAt ?? DateTime.UtcNow
            });
            return Ok(new ApiMessageDto { Message = "Quantity confirmed. Item transferred to VAS station." });
        }

        private async Task BroadcastOutboundQueueUpdatedAsync(Order order)
        {
            await _notificationHub.SendToBranchAndSuperAdminAsync(order.Branch, "OutboundQueueUpdated", new
            {
                orderId = order.OrderId,
                branch = order.Branch ?? "N/A",
                status = order.Status,
                updatedAt = order.UpdatedAt ?? DateTime.UtcNow
            });
        }

        private async Task PushLowStockNotificationIfNeeded(Inventory product, string branch)
        {
            var threshold = product.CriticalThreshold ?? 5;
            if (product.QuantityOnHand > threshold)
            {
                return;
            }

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

                var message = $"Low stock alert: {product.SKU} ({product.Size}) is now {product.QuantityOnHand}.";
                _context.BranchNotifications.Add(new BranchNotification
                {
                    NotificationId = IdGenerator.Create("NTF"),
                    Branch = branch,
                    RecipientUserId = manager.Id,
                    Type = "LowStock",
                    Size = product.Size,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });

                await _notificationHub.SendToBranchAndSuperAdminAsync(branch, "LowStockAlert", new
                {
                    ManagerId = manager.Id,
                    branch,
                    product.SKU,
                    product.Size,
                    product.QuantityOnHand,
                    threshold,
                    message
                });
            }
        }

        private async Task ReleaseBinSlotsIfNeededAsync(Inventory product, int previousQty, int newQty)
        {
            if (string.IsNullOrWhiteSpace(product.BinId))
            {
                return;
            }

            var unitsToRelease = Math.Max(0, previousQty - newQty);
            if (unitsToRelease <= 0)
            {
                return;
            }

            var bin = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinId == product.BinId);
            if (bin == null)
            {
                return;
            }

            bin.OccupiedQty = Math.Max(0, bin.OccupiedQty - unitsToRelease);
            bin.IsAvailable = bin.OccupiedQty < bin.BinCapacity;
            bin.BinStatus = bin.OccupiedQty > 0 ? "Occupied" : "Available";
            bin.UpdatedAt = DateTime.UtcNow;
        }
    }
}
