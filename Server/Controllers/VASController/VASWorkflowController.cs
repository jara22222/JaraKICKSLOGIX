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

namespace Server.Controllers.VASController
{
    [ApiController]
    [Route("api/[controller]")]
    public class VASWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;

        public VASWorkflowController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub)
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [Authorize(Roles = "VASPersonnel")]
        [HttpGet("pending-items")]
        public async Task<ActionResult<List<DispatchOrderDto>>> GetPendingItemsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<DispatchOrderDto>());
            }

            var items = await _context.Orders
                .Where(order =>
                    order.Branch == currentBranch &&
                    (order.Status == "ToVAS" ||
                    order.Status == "ToVas" ||
                    order.Status == "Packing"))
                .OrderByDescending(order => order.CreatedAt)
                .Select(order => new DispatchOrderDto
                {
                    OrderId = order.OrderId,
                    SKU = order.SKU,
                    Size = order.Size,
                    Quantity = order.Quantity,
                    Status = order.Status,
                    CustomerName = order.CustomerName,
                    CustomerAddress = order.CustomerAddress,
                    CourierId = order.CourierId,
                    CreatedAt = order.CreatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [Authorize(Roles = "VASPersonnel")]
        [HttpGet("outbound-ready-items")]
        public async Task<ActionResult<List<DispatchOrderDto>>> GetOutboundReadyItemsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<DispatchOrderDto>());
            }

            var items = await _context.Orders
                .Where(order =>
                    order.Status == "OutboundReady" &&
                    order.Branch == currentBranch)
                .OrderByDescending(order => order.UpdatedAt ?? order.CreatedAt)
                .Select(order => new DispatchOrderDto
                {
                    OrderId = order.OrderId,
                    SKU = order.SKU,
                    Size = order.Size,
                    Quantity = order.Quantity,
                    Status = order.Status,
                    CustomerName = order.CustomerName,
                    CustomerAddress = order.CustomerAddress,
                    CourierId = order.CourierId,
                    CreatedAt = order.CreatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [Authorize]
        [HttpGet("public-outbound-ready-items")]
        public async Task<ActionResult<List<DispatchOrderDto>>> GetPublicOutboundReadyItemsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(currentBranch))
            {
                return Ok(new List<DispatchOrderDto>());
            }

            var items = await _context.Orders
                .Where(order =>
                    order.Status == "OutboundReady" &&
                    order.Branch == currentBranch)
                .OrderByDescending(order => order.UpdatedAt ?? order.CreatedAt)
                .Take(500)
                .Select(order => new DispatchOrderDto
                {
                    OrderId = order.OrderId,
                    SKU = order.SKU,
                    Size = order.Size,
                    Quantity = order.Quantity,
                    Status = order.Status,
                    CustomerName = order.CustomerName,
                    CustomerAddress = order.CustomerAddress,
                    CourierId = order.CourierId,
                    CreatedAt = order.CreatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [Authorize(Roles = "VASPersonnel")]
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

            var vasRoleId = await _context.Roles
                .Where(role => role.Name == "VASPersonnel")
                .Select(role => role.Id)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(vasRoleId))
            {
                return Ok(new List<DispatchActivityDto>());
            }

            var vasUserIds = await _context.UserRoles
                .Where(userRole => userRole.RoleId == vasRoleId)
                .Select(userRole => userRole.UserId)
                .Distinct()
                .ToListAsync();

            if (vasUserIds.Count == 0)
            {
                return Ok(new List<DispatchActivityDto>());
            }

            var currentBranch = currentUser.Branch ?? string.Empty;
            var allowedActions = new[] { "VASScanOut", "VASDone" };
            var logs = await _context.StockMovements
                .Where(movement =>
                    !string.IsNullOrWhiteSpace(movement.PerformedByUserId) &&
                    vasUserIds.Contains(movement.PerformedByUserId) &&
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

        [Authorize(Roles = "VASPersonnel")]
        [HttpPut("scan-packing/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanPackingAsync(string orderId, [FromBody] QrScanDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var branch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(branch) ||
                !string.Equals(order.Branch, branch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (!IsVasScannableStatus(order.Status))
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not ready for VAS packing scan." });
            }

            if (!IsMatchingOrderItemQr(order, dto.QrValue))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned QR does not match VAS item SKU/Size." });
            }

            var fromStatus = order.Status;
            order.Status = "OutboundReady";
            order.UpdatedAt = DateTime.UtcNow;

            var userName = User.Identity?.Name ?? "VASPersonnel";
            var branchLabel = string.IsNullOrWhiteSpace(branch) ? "N/A" : branch;

            _context.StockMovements.Add(new StockMovement
            {
                OrderId = order.OrderId,
                Branch = branchLabel,
                Action = "VASScanOut",
                FromStatus = fromStatus,
                ToStatus = "OutboundReady",
                Quantity = order.Quantity,
                PerformedByUserId = userId ?? "N/A",
                PerformedBy = userName,
                Description = $"{userName} scanned and verified order {order.OrderId}; status moved to OutboundReady.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId ?? "N/A",
                Action = "VASScanOut",
                Branch = branchLabel,
                PerformedBy = userName,
                Description = $"{userName} completed VAS scan for order {order.OrderId} and marked it OutboundReady.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await _notificationHub.SendToBranchAndSuperAdminAsync(order.Branch, "VASQueueUpdated", new
            {
                orderId = order.OrderId,
                branch = branchLabel,
                status = order.Status,
                updatedAt = order.UpdatedAt ?? DateTime.UtcNow
            });
            return Ok(new ApiMessageDto { Message = "Item scanned and verified. Status updated to Outbound Ready." });
        }

        [Authorize(Roles = "VASPersonnel")]
        [HttpPut("mark-done/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> MarkDoneAsync(string orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var branch = currentUser?.Branch ?? string.Empty;
            if (string.IsNullOrWhiteSpace(branch) ||
                !string.Equals(order.Branch, branch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (!IsVasScannableStatus(order.Status))
            {
                return BadRequest(new ApiMessageDto { Message = "Order must be in Packing status before completion." });
            }

            var fromStatus = order.Status;
            order.Status = "OutboundReady";
            order.UpdatedAt = DateTime.UtcNow;

            var userName = User.Identity?.Name ?? "VASPersonnel";
            var branchLabel = string.IsNullOrWhiteSpace(branch) ? "N/A" : branch;

            _context.StockMovements.Add(new StockMovement
            {
                OrderId = order.OrderId,
                Branch = branchLabel,
                Action = "VASDone",
                FromStatus = fromStatus,
                ToStatus = "OutboundReady",
                Quantity = order.Quantity,
                PerformedByUserId = userId ?? "N/A",
                PerformedBy = userName,
                Description = $"{userName} finalized VAS for order {order.OrderId} and marked it OutboundReady.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId ?? "N/A",
                Action = "VASDone",
                Branch = branchLabel,
                PerformedBy = userName,
                Description = $"{userName} completed VAS for order {order.OrderId} and moved to OutboundReady.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await _notificationHub.SendToBranchAndSuperAdminAsync(order.Branch, "VASQueueUpdated", new
            {
                orderId = order.OrderId,
                branch = branchLabel,
                status = order.Status,
                updatedAt = order.UpdatedAt ?? DateTime.UtcNow
            });
            return Ok(new ApiMessageDto { Message = "VAS completed. Order marked as Outbound Ready." });
        }

        private static bool IsVasScannableStatus(string? status)
        {
            return string.Equals(status, "ToVAS", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(status, "Packing", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsMatchingOrderItemQr(Order order, string scannedRaw)
        {
            var scanned = NormalizeQr(scannedRaw);
            if (string.IsNullOrWhiteSpace(scanned))
            {
                return false;
            }

            var sku = NormalizeQr(order.SKU);
            var size = NormalizeQr(order.Size);

            // Strict same item check: SKU + Size must both match.
            if (ContainsToken(scanned, "SKU", sku) && ContainsToken(scanned, "SIZE", size))
            {
                return true;
            }

            var compactScanned = scanned.Replace(" ", string.Empty);
            var skuSizeSlash = $"{sku}/{size}";
            var skuSizeDash = $"{sku}-{size}";
            var skuSizePipe = $"{sku}|{size}";
            if (string.Equals(compactScanned, skuSizeSlash, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(compactScanned, skuSizeDash, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(compactScanned, skuSizePipe, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // If QR string is larger payload, require both fragments present.
            var hasSku = compactScanned.Contains(sku, StringComparison.OrdinalIgnoreCase);
            var hasSize = compactScanned.Contains(size, StringComparison.OrdinalIgnoreCase);
            return hasSku && hasSize;
        }

        private static bool ContainsToken(string scanned, string tokenName, string expectedValue)
        {
            if (string.IsNullOrWhiteSpace(expectedValue))
            {
                return false;
            }

            var marker = $"{tokenName}:";
            var parts = scanned.Split('|', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                var segment = part.Trim();
                if (!segment.StartsWith(marker, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var tokenValue = segment.Substring(marker.Length).Trim();
                if (string.Equals(tokenValue, expectedValue, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            return false;
        }

        private static string NormalizeQr(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            return value.Trim().Replace("\r", "").Replace("\n", "");
        }
    }
}
