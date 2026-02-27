using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers.PutAwayController
{
    [ApiController]
    [Route("api/[controller]")]
    public class PutAwayWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PutAwayWorkflowController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "PutAway")]
        [HttpGet("pending-products")]
        public async Task<ActionResult<List<PutAwayTaskDto>>> GetPendingProductsAsync()
        {
            var tasks = await _context.Products
                .Where(product =>
                    product.WorkflowStatus == "PendingPutAway" ||
                    product.WorkflowStatus == "ClaimedForPutAway" ||
                    product.WorkflowStatus == "ItemScanned")
                .Join(
                    _context.BinLocations,
                    product => product.BinId,
                    bin => bin.BinId,
                    (product, bin) => new PutAwayTaskDto
                    {
                        ProductId = product.ProductId,
                        SKU = product.SKU,
                        Size = product.Size,
                        Quantity = product.QuantityOnHand,
                        WorkflowStatus = product.WorkflowStatus,
                        BinId = bin.BinId,
                        BinLocation = bin.BinLocationCode,
                        ItemQrString = product.QrString,
                        DateReceived = product.DateReceived
                    }
                )
                .OrderByDescending(task => task.DateReceived)
                .ToListAsync();

            return Ok(tasks);
        }

        [Authorize(Roles = "PutAway")]
        [HttpPut("claim/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ClaimTaskAsync(string productId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Product task not found." });
            }

            if (product.WorkflowStatus != "PendingPutAway")
            {
                return BadRequest(new ApiMessageDto { Message = "Task is no longer available for claim." });
            }

            await LogPutAwayTransition(product, "ClaimPutAway", "PendingPutAway", "ClaimedForPutAway");
            product.WorkflowStatus = "ClaimedForPutAway";
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new ApiMessageDto { Message = "Task claimed. Proceed to item scan." });
        }

        [Authorize(Roles = "PutAway")]
        [HttpPut("scan-item/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanItemAsync(string productId, [FromBody] QrScanDto dto)
        {
            var product = await _context.Products.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Product task not found." });
            }

            if (product.WorkflowStatus != "ClaimedForPutAway")
            {
                return BadRequest(new ApiMessageDto { Message = "Task is not ready for item scan." });
            }

            if (!string.Equals(product.QrString, dto.QrValue.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned item QR does not match." });
            }

            await LogPutAwayTransition(product, "ScanItem", "ClaimedForPutAway", "ItemScanned");
            product.WorkflowStatus = "ItemScanned";
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new ApiMessageDto { Message = "Item QR verified. Proceed to bin scan." });
        }

        [Authorize(Roles = "PutAway")]
        [HttpPut("scan-bin/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanBinAsync(string productId, [FromBody] QrScanDto dto)
        {
            var product = await _context.Products.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Product task not found." });
            }

            if (product.WorkflowStatus != "ItemScanned")
            {
                return BadRequest(new ApiMessageDto { Message = "Item must be scanned before bin scan." });
            }

            var targetBin = await _context.BinLocations.FirstOrDefaultAsync(bin => bin.BinId == product.BinId);
            if (targetBin == null)
            {
                return NotFound(new ApiMessageDto { Message = "Assigned bin not found." });
            }

            if (!string.Equals(targetBin.QrCodeString, dto.QrValue.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned bin QR does not match assigned bin." });
            }

            await LogPutAwayTransition(product, "StoreInBin", "ItemScanned", "Stored");
            product.WorkflowStatus = "Stored";
            product.UpdatedAt = DateTime.UtcNow;
            targetBin.BinStatus = "Occupied";
            targetBin.IsAvailable = false;
            targetBin.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Bin QR verified. Product stored successfully." });
        }

        private async Task LogPutAwayTransition(
            Products product,
            string action,
            string fromStatus,
            string toStatus
        )
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserName = User.Identity?.Name ?? "PutAway";
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var branchName = currentUser?.Branch ?? "N/A";

            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.ProductId,
                BinId = product.BinId,
                Branch = branchName,
                Action = action,
                FromStatus = fromStatus,
                ToStatus = toStatus,
                Quantity = product.QuantityOnHand,
                PerformedByUserId = currentUserId ?? "N/A",
                PerformedBy = currentUserName,
                Description = $"{currentUserName} moved product {product.SKU} from {fromStatus} to {toStatus}.",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId ?? "N/A",
                Action = action,
                Branch = branchName,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} moved {product.SKU} from {fromStatus} to {toStatus}.",
                DatePerformed = DateTime.UtcNow
            });
        }
    }
}
