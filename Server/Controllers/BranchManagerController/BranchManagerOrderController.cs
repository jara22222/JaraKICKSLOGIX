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

namespace Server.Controllers.BranchManagerController
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchManagerOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;

        public BranchManagerOrderController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub)
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPost("create-order")]
        public async Task<ActionResult<DispatchOrderDto>> CreateOrderAsync([FromBody] DispatchOrderDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var branch = currentUser?.Branch ?? "N/A";
            var order = new Order
            {
                OrderId = IdGenerator.Create("ORD"),
                Branch = branch,
                CustomerName = dto.CustomerName,
                CustomerAddress = dto.CustomerAddress,
                CourierId = dto.CourierId,
                SKU = dto.SKU,
                Size = dto.Size,
                Quantity = dto.Quantity,
                Status = "PendingApproval",
                Source = "WebStore",
                CreatedAt = DateTime.UtcNow
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            dto.OrderId = order.OrderId;
            dto.Status = order.Status;
            dto.CreatedAt = order.CreatedAt;
            return Ok(dto);
        }

        [Authorize(Roles = "BranchManager")]
        [HttpGet("pending-orders")]
        public async Task<ActionResult<List<DispatchOrderDto>>> GetPendingOrdersAsync()
        {
            var orders = await _context.Orders
                .Where(order => order.Status == "PendingApproval")
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

        [Authorize(Roles = "BranchManager")]
        [HttpGet("outbound-logs")]
        public async Task<ActionResult<List<BranchOutboundLogDto>>> GetOutboundLogsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;

            var baseQuery = _context.Orders
                .Where(order =>
                    order.Status == "Approved" ||
                    order.Status == "DispatchClaimed" ||
                    order.Status == "ToVAS");

            if (!string.IsNullOrWhiteSpace(currentBranch))
            {
                baseQuery = baseQuery.Where(order => order.Branch == currentBranch);
            }

            var orders = await baseQuery
                .OrderByDescending(order => order.UpdatedAt ?? order.CreatedAt)
                .Take(500)
                .ToListAsync();

            var orderIds = orders.Select(order => order.OrderId).ToList();
            var orderMovements = await _context.StockMovements
                .Where(movement =>
                    movement.OrderId != null &&
                    orderIds.Contains(movement.OrderId) &&
                    movement.Action == "DispatchToVAS")
                .OrderByDescending(movement => movement.OccurredAt)
                .ToListAsync();

            var latestMovementByOrder = orderMovements
                .GroupBy(movement => movement.OrderId!)
                .ToDictionary(group => group.Key, group => group.First());

            var binIds = orderMovements
                .Where(movement => !string.IsNullOrWhiteSpace(movement.BinId))
                .Select(movement => movement.BinId!)
                .Distinct()
                .ToList();
            var bins = await _context.BinLocations
                .Where(bin => binIds.Contains(bin.BinId))
                .ToDictionaryAsync(bin => bin.BinId, bin => bin.BinLocationCode);

            var skuList = orders.Select(order => order.SKU).Distinct().ToList();
            var sizeList = orders.Select(order => order.Size).Distinct().ToList();
            var inventoryForNames = await _context.Inventory
                .Where(item => skuList.Contains(item.SKU) && sizeList.Contains(item.Size))
                .ToListAsync();

            var logs = orders.Select(order =>
            {
                latestMovementByOrder.TryGetValue(order.OrderId, out var movement);
                var productName = inventoryForNames
                    .Where(item => item.SKU == order.SKU && item.Size == order.Size)
                    .Select(item => item.ProductName)
                    .FirstOrDefault();

                var mappedStatus = order.Status switch
                {
                    "ToVAS" => "Verified",
                    "DispatchClaimed" => "In Progress",
                    "Approved" => "Pending Pick",
                    _ => "Flagged"
                };

                var fallbackPickId = order.OrderId.Length >= 8
                    ? $"PICK-{order.OrderId.Substring(0, 8).ToUpper()}"
                    : $"PICK-{order.OrderId.ToUpper()}";

                return new BranchOutboundLogDto
                {
                    PickId = movement?.MovementId ?? fallbackPickId,
                    OrderRef = order.OrderId,
                    Product = string.IsNullOrWhiteSpace(productName) ? order.SKU : productName,
                    SKU = order.SKU,
                    QtyPicked = order.Quantity,
                    PickedByName = movement?.PerformedBy ?? "Pending",
                    PickedByTime = (movement?.OccurredAt ?? order.UpdatedAt ?? order.CreatedAt)
                        .ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    BinLocation = movement?.BinId != null && bins.TryGetValue(movement.BinId, out var binLocation)
                        ? binLocation
                        : "N/A",
                    Status = mappedStatus
                };
            }).ToList();

            return Ok(logs);
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("approve/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ApproveOrderAsync(string orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }

            order.Status = "Approved";
            order.ApprovedByUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            order.ApprovedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _notificationHub.Clients.All.SendAsync("OutboundOrderApproved", new
            {
                orderId = order.OrderId,
                branch = order.Branch ?? "N/A",
                status = order.Status,
                approvedAt = order.ApprovedAt ?? DateTime.UtcNow
            });
            await _notificationHub.Clients.All.SendAsync("OutboundQueueUpdated", new
            {
                orderId = order.OrderId,
                branch = order.Branch ?? "N/A",
                status = order.Status,
                updatedAt = order.UpdatedAt ?? DateTime.UtcNow
            });

            return Ok(new ApiMessageDto { Message = "Order approved for dispatch." });
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("cancel/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> CancelOrderAsync(string orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }

            order.Status = "Cancelled";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Order cancelled." });
        }
    }
}
