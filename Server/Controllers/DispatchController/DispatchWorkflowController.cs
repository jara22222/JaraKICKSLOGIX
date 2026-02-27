using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Hubs.BranchManagerHub;
using Server.Models;
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
            var orders = await _context.Orders
                .Where(order =>
                    order.Status == "Approved" ||
                    order.Status == "DispatchClaimed" ||
                    order.Status == "ItemScanned")
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

            return Ok(orders);
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpPut("claim/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ClaimAsync(string orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }

            if (order.Status != "Approved")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not available for dispatch claim." });
            }

            order.Status = "DispatchClaimed";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Dispatch task claimed. Proceed to item scan." });
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpPut("scan-item/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanItemAsync(string orderId, [FromBody] QrScanDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }

            if (order.Status != "DispatchClaimed")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not ready for item scan." });
            }

            if (!dto.QrValue.Contains(order.SKU, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned item does not match order SKU." });
            }

            order.Status = "ItemScanned";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Item QR verified. Confirm quantity to transfer to VAS." });
        }

        [Authorize(Roles = "DispatchClerk")]
        [HttpPut("confirm-quantity/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ConfirmQuantityAsync(
            string orderId,
            [FromBody] ConfirmDispatchQtyDto dto
        )
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }

            if (order.Status != "ItemScanned")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not ready for quantity confirmation." });
            }

            if (dto.Quantity > order.Quantity)
            {
                return BadRequest(new ApiMessageDto { Message = "Confirmed quantity exceeds order quantity." });
            }

            var product = await _context.Products
                .Where(item => item.SKU == order.SKU && item.Size == order.Size && item.QuantityOnHand > 0)
                .OrderBy(item => item.DateReceived)
                .FirstOrDefaultAsync();

            if (product == null || product.QuantityOnHand < dto.Quantity)
            {
                return BadRequest(new ApiMessageDto { Message = "Insufficient inventory quantity for this order." });
            }

            product.QuantityOnHand -= dto.Quantity;
            product.ItemQty = product.QuantityOnHand.ToString();
            product.UpdatedAt = DateTime.UtcNow;

            order.Quantity = dto.Quantity;
            order.Status = "ToVAS";
            order.UpdatedAt = DateTime.UtcNow;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var userName = User.Identity?.Name ?? "DispatchClerk";
            var branch = currentUser?.Branch ?? "N/A";

            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.ProductId,
                OrderId = order.OrderId,
                BinId = product.BinId,
                Branch = branch,
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
                Branch = branch,
                PerformedBy = userName,
                Description = $"{userName} dispatched order {order.OrderId} to VAS with qty {dto.Quantity}.",
                DatePerformed = DateTime.UtcNow
            });

            await PushLowStockNotificationIfNeeded(product, branch);
            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Quantity confirmed. Item transferred to VAS station." });
        }

        private async Task PushLowStockNotificationIfNeeded(Products product, string branch)
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
                    NotificationId = Guid.NewGuid().ToString(),
                    Branch = branch,
                    RecipientUserId = manager.Id,
                    Type = "LowStock",
                    Size = product.Size,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });

                await _notificationHub.Clients.All.SendAsync("LowStockAlert", new
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
    }
}
