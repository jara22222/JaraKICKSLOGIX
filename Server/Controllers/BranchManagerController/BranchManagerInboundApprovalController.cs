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
    public class BranchManagerInboundApprovalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BranchManagerInboundApprovalController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "BranchManager")]
        [HttpGet("pending-supplier-shipments")]
        public async Task<ActionResult<List<InboundIncomingShipmentDto>>> GetPendingSupplierShipmentsAsync()
        {
            var pending = await _context.Inventory
                .Where(item => item.WorkflowStatus == "PendingAdminApproval")
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
                    Status = item.WorkflowStatus
                })
                .Take(300)
                .ToListAsync();

            return Ok(pending);
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("approve-supplier-shipment/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ApproveSupplierShipmentAsync(string productId)
        {
            var product = await _context.Inventory.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Supplier shipment not found." });
            }

            if (product.WorkflowStatus != "PendingAdminApproval")
            {
                return BadRequest(new ApiMessageDto { Message = "Shipment is not pending admin approval." });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var currentUserName = User.Identity?.Name ?? currentUser?.UserName ?? "BranchManager";
            var branch = currentUser?.Branch ?? "N/A";

            product.WorkflowStatus = "PendingReceive";
            product.UpdatedAt = DateTime.UtcNow;

            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.ProductId,
                Branch = branch,
                Action = "ApproveSupplierShipment",
                FromStatus = "PendingAdminApproval",
                ToStatus = "PendingReceive",
                Quantity = product.QuantityOnHand,
                PerformedByUserId = currentUserId,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} approved supplier shipment {product.SKU} for receiver processing.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "ApproveSupplierShipment",
                Branch = branch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} approved supplier shipment {product.SKU}.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new ApiMessageDto { Message = "Supplier shipment approved for receiver." });
        }
    }
}
