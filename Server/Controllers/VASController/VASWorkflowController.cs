using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers.VASController
{
    [ApiController]
    [Route("api/[controller]")]
    public class VASWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VASWorkflowController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "VASPersonnel")]
        [HttpGet("pending-items")]
        public async Task<ActionResult<List<DispatchOrderDto>>> GetPendingItemsAsync()
        {
            var items = await _context.Orders
                .Where(order => order.Status == "ToVAS" || order.Status == "Packing")
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
        [HttpPut("scan-packing/{orderId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanPackingAsync(string orderId, [FromBody] QrScanDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(item => item.OrderId == orderId);
            if (order == null)
            {
                return NotFound(new ApiMessageDto { Message = "Order not found." });
            }

            if (order.Status != "ToVAS")
            {
                return BadRequest(new ApiMessageDto { Message = "Order is not ready for VAS packing scan." });
            }

            if (!dto.QrValue.Contains(order.SKU, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned QR does not match VAS item SKU." });
            }

            order.Status = "Packing";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Item scanned. VAS status updated to Packing." });
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

            if (order.Status != "Packing")
            {
                return BadRequest(new ApiMessageDto { Message = "Order must be in Packing status before completion." });
            }

            order.Status = "Done";
            order.UpdatedAt = DateTime.UtcNow;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.Identity?.Name ?? "VASPersonnel";
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
            var branch = currentUser?.Branch ?? "N/A";

            _context.StockMovements.Add(new StockMovement
            {
                OrderId = order.OrderId,
                Branch = branch,
                Action = "VASDone",
                FromStatus = "Packing",
                ToStatus = "Done",
                Quantity = order.Quantity,
                PerformedByUserId = userId ?? "N/A",
                PerformedBy = userName,
                Description = $"{userName} marked order {order.OrderId} as done after label assignment.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId ?? "N/A",
                Action = "VASDone",
                Branch = branch,
                PerformedBy = userName,
                Description = $"{userName} completed VAS for order {order.OrderId}.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "VAS completed. Order marked as Done." });
        }
    }
}
