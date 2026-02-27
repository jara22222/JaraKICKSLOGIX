using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers.BranchManagerController
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchManagerOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BranchManagerOrderController(ApplicationDbContext context)
        {
            _context = context;
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
                OrderId = Guid.NewGuid().ToString(),
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
