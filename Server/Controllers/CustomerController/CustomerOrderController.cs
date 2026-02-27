using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;

namespace Server.Controllers.CustomerController
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomerOrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpPost("submit-order")]
        public async Task<ActionResult<object>> SubmitOrderAsync([FromBody] CustomerOrderSubmissionDto dto)
        {
            try
            {
                var order = new Order
                {
                    OrderId = Guid.NewGuid().ToString(),
                    Branch = dto.Branch.Trim(),
                    CustomerName = dto.CustomerName.Trim(),
                    CustomerAddress = dto.CustomerAddress.Trim(),
                    CourierId = dto.CourierId.Trim(),
                    Source = "CustomerAPI",
                    SKU = dto.SKU.Trim(),
                    Size = dto.Size.Trim().ToUpperInvariant(),
                    Quantity = dto.Quantity,
                    Status = "PendingApproval",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = "ExternalCustomer",
                    Action = "CustomerSubmit",
                    Branch = order.Branch,
                    PerformedBy = "ExternalCustomer",
                    Description = $"Customer submitted order {order.OrderId} for {order.SKU} qty {order.Quantity}.",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Customer order submitted successfully.",
                    orderId = order.OrderId,
                    status = order.Status
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
    }
}
