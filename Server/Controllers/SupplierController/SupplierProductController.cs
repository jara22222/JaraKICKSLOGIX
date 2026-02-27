using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers.SupplierEndpoints
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupplierProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SupplierProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Supplier")]
        [HttpPost("submit-product")]
        public async Task<ActionResult<object>> SubmitProductAsync([FromBody] SupplierProductSubmissionDto dto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var userName = User.Identity?.Name ?? "Supplier";
                var supplierUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == userId);
                var branch = supplierUser?.Branch ?? "N/A";
                var normalizedSku = dto.SKU.Trim();
                var normalizedSize = dto.Size.Trim().ToUpperInvariant();

                var product = new Products
                {
                    ProductId = Guid.NewGuid().ToString(),
                    SupplierId = userId,
                    ItemQty = dto.Quantity.ToString(),
                    QuantityOnHand = dto.Quantity,
                    SKU = normalizedSku,
                    Size = normalizedSize,
                    QrString = $"PRODUCT:{normalizedSku}:{Guid.NewGuid()}",
                    CriticalThreshold = GetThresholdBySize(normalizedSize),
                    WorkflowStatus = "PendingReceive",
                    BinId = null,
                    IsBinAssigned = false,
                    DateReceived = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Products.Add(product);
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.ProductId,
                    Branch = branch,
                    Action = "SupplierSubmit",
                    ToStatus = "PendingReceive",
                    Quantity = dto.Quantity,
                    PerformedByUserId = userId,
                    PerformedBy = userName,
                    Description = $"{userName} submitted product {dto.ProductName} ({normalizedSku}) qty {dto.Quantity}.",
                    OccurredAt = DateTime.UtcNow
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = userId,
                    Action = "SupplierSubmit",
                    Branch = branch,
                    PerformedBy = userName,
                    Description = $"{userName} submitted product {dto.ProductName} ({normalizedSku}) qty {dto.Quantity}.",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Supplier product submitted successfully.",
                    productId = product.ProductId,
                    status = product.WorkflowStatus
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

        private static int GetThresholdBySize(string size)
        {
            return size switch
            {
                "S" => 15,
                "M" => 12,
                "L" => 10,
                "XL" => 8,
                "XXL" => 5,
                _ => 5
            };
        }
    }
}
