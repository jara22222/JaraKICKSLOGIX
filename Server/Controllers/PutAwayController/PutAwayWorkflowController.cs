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

        [Authorize(Roles = "PutAway,Receiver")]
        [HttpGet("pending-products")]
        public async Task<ActionResult<List<PutAwayTaskDto>>> GetPendingProductsAsync()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

            var tasks = await _context.Inventory
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

            if (!string.IsNullOrWhiteSpace(currentUserId))
            {
                var productIds = tasks.Select(task => task.ProductId).Distinct().ToList();
                if (productIds.Count > 0)
                {
                    var claimEvents = await _context.StockMovements
                        .Where(movement =>
                            movement.Action == "ClaimPutAway" &&
                            movement.ProductId != null &&
                            productIds.Contains(movement.ProductId) &&
                            movement.ToStatus == "ClaimedForPutAway")
                        .OrderByDescending(movement => movement.OccurredAt)
                        .ToListAsync();

                    var latestClaimByProduct = claimEvents
                        .GroupBy(movement => movement.ProductId!)
                        .ToDictionary(group => group.Key, group => group.First());

                    foreach (var task in tasks)
                    {
                        if (latestClaimByProduct.TryGetValue(task.ProductId, out var claim))
                        {
                            var isClaimOwnerPutAway = await IsPutAwayUserAsync(claim.PerformedByUserId);
                            if (isClaimOwnerPutAway)
                            {
                                task.ClaimedByUserId = claim.PerformedByUserId;
                                task.ClaimedBy = claim.PerformedBy;
                            }
                        }
                    }
                }
            }

            return Ok(tasks);
        }

        [Authorize(Roles = "PutAway,Receiver")]
        [HttpPut("claim/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ClaimTaskAsync(string productId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var product = await _context.Inventory.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Product task not found." });
            }

            if (product.WorkflowStatus != "PendingPutAway")
            {
                return BadRequest(new ApiMessageDto { Message = "Task is no longer available for claim." });
            }

            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                return Unauthorized(new ApiMessageDto { Message = "Unable to identify current user." });
            }

            var isCurrentUserPutAway = await IsPutAwayUserAsync(currentUserId);
            if (!isCurrentUserPutAway)
            {
                return BadRequest(new ApiMessageDto { Message = "Only Put-Away users can claim put-away tasks." });
            }

            if (product.WorkflowStatus == "ClaimedForPutAway")
            {
                var existingClaimedByUserId = await GetClaimedByUserIdAsync(product.ProductId);
                if (string.Equals(existingClaimedByUserId, currentUserId, StringComparison.Ordinal))
                {
                    return Ok(new ApiMessageDto { Message = "Task is already assigned to your queue." });
                }

                // Allow Put-Away takeover only when existing claim was from a non Put-Away user.
                if (!string.IsNullOrWhiteSpace(existingClaimedByUserId))
                {
                    var isExistingOwnerPutAway = await IsPutAwayUserAsync(existingClaimedByUserId);
                    if (isExistingOwnerPutAway)
                    {
                        return BadRequest(new ApiMessageDto { Message = "Task is already assigned to another put-away user." });
                    }
                }

                await LogPutAwayTransition(product, "ClaimPutAway", "ClaimedForPutAway", "ClaimedForPutAway");
                product.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new ApiMessageDto { Message = "Task reassigned to your queue." });
            }

            await LogPutAwayTransition(product, "ClaimPutAway", "PendingPutAway", "ClaimedForPutAway");
            product.WorkflowStatus = "ClaimedForPutAway";
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new ApiMessageDto { Message = "Task claimed. Proceed to item scan." });
        }

        [Authorize(Roles = "PutAway,Receiver")]
        [HttpPut("scan-item/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanItemAsync(string productId, [FromBody] QrScanDto dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var product = await _context.Inventory.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Product task not found." });
            }

            if (product.WorkflowStatus != "ClaimedForPutAway")
            {
                return BadRequest(new ApiMessageDto { Message = "Task is not ready for item scan." });
            }

            var claimedByUserId = await GetClaimedByUserIdAsync(product.ProductId);
            if (string.IsNullOrWhiteSpace(claimedByUserId))
            {
                return BadRequest(new ApiMessageDto { Message = "Task owner not found. Please re-claim this task." });
            }
            var isClaimOwnerPutAway = await IsPutAwayUserAsync(claimedByUserId);
            if (!isClaimOwnerPutAway)
            {
                return BadRequest(new ApiMessageDto { Message = "Task owner is not a put-away user. Please claim again as Put-Away." });
            }
            if (!string.Equals(claimedByUserId, currentUserId, StringComparison.Ordinal))
            {
                return BadRequest(new ApiMessageDto { Message = "This task is assigned to another put-away user." });
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

        [Authorize(Roles = "PutAway,Receiver")]
        [HttpPut("scan-bin/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ScanBinAsync(string productId, [FromBody] QrScanDto dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var product = await _context.Inventory.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Product task not found." });
            }

            if (product.WorkflowStatus != "ItemScanned")
            {
                return BadRequest(new ApiMessageDto { Message = "Item must be scanned before bin scan." });
            }

            var claimedByUserId = await GetClaimedByUserIdAsync(product.ProductId);
            if (string.IsNullOrWhiteSpace(claimedByUserId))
            {
                return BadRequest(new ApiMessageDto { Message = "Task owner not found. Please re-claim this task." });
            }
            var isClaimOwnerPutAway = await IsPutAwayUserAsync(claimedByUserId);
            if (!isClaimOwnerPutAway)
            {
                return BadRequest(new ApiMessageDto { Message = "Task owner is not a put-away user. Please claim again as Put-Away." });
            }
            if (!string.Equals(claimedByUserId, currentUserId, StringComparison.Ordinal))
            {
                return BadRequest(new ApiMessageDto { Message = "This task is assigned to another put-away user." });
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

        private async Task<string?> GetClaimedByUserIdAsync(string productId)
        {
            var claimEvent = await _context.StockMovements
                .Where(movement =>
                    movement.ProductId == productId &&
                    movement.Action == "ClaimPutAway" &&
                    movement.ToStatus == "ClaimedForPutAway")
                .OrderByDescending(movement => movement.OccurredAt)
                .FirstOrDefaultAsync();

            return claimEvent?.PerformedByUserId;
        }

        private async Task<bool> IsPutAwayUserAsync(string? userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return false;

            return await _context.UserRoles
                .Join(
                    _context.Roles,
                    userRole => userRole.RoleId,
                    role => role.Id,
                    (userRole, role) => new { userRole, role }
                )
                .AnyAsync(entry =>
                    entry.userRole.UserId == userId &&
                    entry.role.Name == "PutAway");
        }

        private async Task LogPutAwayTransition(
            Inventory product,
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
