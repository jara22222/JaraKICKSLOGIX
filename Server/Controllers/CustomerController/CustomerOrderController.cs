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

namespace Server.Controllers.CustomerController
{
    [ApiController]
    [Route("api/SupplierOrder")]
    public class CustomerOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;

        public CustomerOrderController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub
        )
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [AllowAnonymous]
        [HttpPost("submit-order")]
        public async Task<ActionResult<object>> SubmitOrderAsync([FromBody] CustomerOrderSubmissionDto dto)
        {
            try
            {
                var normalizedSku = dto.SKU.Trim().ToUpperInvariant();
                var normalizedProductName = dto.ProductName.Trim();
                var requestedSize = string.IsNullOrWhiteSpace(dto.Size)
                    ? string.Empty
                    : dto.Size.Trim().ToUpperInvariant();
                var normalizedSize = requestedSize;

                if (string.IsNullOrWhiteSpace(requestedSize))
                {
                    var resolvedSize = await ResolveSizeBySkuAsync(normalizedSku);
                    if (string.IsNullOrWhiteSpace(resolvedSize))
                    {
                        return BadRequest(new ApiMessageDto
                        {
                            Message = "Cannot submit order. Product SKU is not available in inventory."
                        });
                    }

                    normalizedSize = resolvedSize;
                }

                var availableQuantity = await _context.Inventory
                    .Where(item =>
                        item.SKU == normalizedSku &&
                        item.Size == normalizedSize &&
                        item.WorkflowStatus != "Archived" &&
                        item.QuantityOnHand > 0)
                    .SumAsync(item => (int?)item.QuantityOnHand) ?? 0;

                if (availableQuantity <= 0)
                {
                    return BadRequest(new ApiMessageDto
                    {
                        Message = "Cannot submit order. Product is not available in inventory."
                    });
                }

                if (dto.Quantity > availableQuantity)
                {
                    return BadRequest(new ApiMessageDto
                    {
                        Message = $"Cannot submit order. Requested quantity ({dto.Quantity}) exceeds available stock ({availableQuantity}) for SKU {normalizedSku} size {normalizedSize}."
                    });
                }

                var normalizedBranch = string.IsNullOrWhiteSpace(dto.Branch)
                    ? await ResolveDefaultBranchAsync()
                    : dto.Branch.Trim();

                var order = new Order
                {
                    OrderId = IdGenerator.Create("ORD"),
                    Branch = normalizedBranch,
                    CustomerName = dto.CustomerName.Trim(),
                    CustomerAddress = dto.CustomerAddress.Trim(),
                    CourierId = dto.CourierId.Trim(),
                    Source = "SupplierAPI",
                    SKU = normalizedSku,
                    Size = normalizedSize,
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
                    PerformedBy = "SupplierAPI",
                    Description = $"Supplier submitted order {order.OrderId} for {normalizedProductName} ({order.SKU}) qty {order.Quantity}.",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                await _notificationHub.Clients.All.SendAsync("OutboundQueueUpdated", new
                {
                    orderId = order.OrderId,
                    branch = order.Branch ?? "N/A",
                    status = order.Status,
                    updatedAt = order.CreatedAt
                });

                return Ok(new
                {
                    message = "Order submitted successfully and routed for branch admin approval.",
                    orderId = order.OrderId,
                    productName = normalizedProductName,
                    sku = order.SKU,
                    quantity = order.Quantity,
                    courierId = order.CourierId,
                    customerName = order.CustomerName,
                    customerAddress = order.CustomerAddress,
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

        private async Task<string> ResolveDefaultBranchAsync()
        {
            var branch = await _context.Users
                .Where(user => !string.IsNullOrWhiteSpace(user.Branch))
                .Select(user => user.Branch!)
                .FirstOrDefaultAsync();

            return string.IsNullOrWhiteSpace(branch) ? "N/A" : branch.Trim();
        }

        private async Task<string?> ResolveSizeBySkuAsync(string sku)
        {
            if (string.IsNullOrWhiteSpace(sku))
            {
                return null;
            }

            var matched = await _context.Inventory
                .Where(item =>
                    item.SKU == sku &&
                    item.WorkflowStatus != "Archived" &&
                    item.QuantityOnHand > 0)
                .OrderByDescending(item => item.QuantityOnHand)
                .Select(item => item.Size)
                .FirstOrDefaultAsync();

            return string.IsNullOrWhiteSpace(matched)
                ? null
                : matched.Trim().ToUpperInvariant();
        }
    }
}
