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

namespace Server.Controllers.PutAwayController
{
    [ApiController]
    [Route("api/[controller]")]
    public class PutAwayWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;

        public PutAwayWorkflowController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub
        )
        {
            _context = context;
            _notificationHub = notificationHub;
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

            if (!IsMatchingItemQr(product, dto.QrValue))
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

            if (!IsMatchingBinQr(targetBin, dto.QrValue))
            {
                return BadRequest(new ApiMessageDto { Message = "Scanned bin QR does not match assigned bin." });
            }

            await LogPutAwayTransition(product, "StoreInBin", "ItemScanned", "Stored");
            product.WorkflowStatus = "Stored";
            product.UpdatedAt = DateTime.UtcNow;
            targetBin.IsAvailable = targetBin.OccupiedQty < targetBin.BinCapacity;
            targetBin.BinStatus = targetBin.OccupiedQty > 0 ? "Occupied" : "Available";
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

            await _notificationHub.Clients.All.SendAsync("PutAwayTaskUpdated", new
            {
                productId = product.ProductId,
                sku = product.SKU,
                action,
                fromStatus,
                toStatus,
                performedBy = currentUserName,
                branch = branchName,
                occurredAt = DateTime.UtcNow
            });
        }

        private static bool IsMatchingItemQr(Inventory product, string scannedRaw)
        {
            var scanned = NormalizeQrValue(scannedRaw);
            var expected = NormalizeQrValue(product.QrString);

            if (string.IsNullOrWhiteSpace(scanned))
            {
                return false;
            }

            // Primary exact match.
            if (string.Equals(scanned, expected, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var sku = NormalizeQrValue(product.SKU);
            var productId = NormalizeQrValue(product.ProductId);

            // Accept direct SKU scan (fallback stickers/manual entry).
            if (!string.IsNullOrWhiteSpace(sku) &&
                string.Equals(scanned, sku, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Accept structured payloads that include PID / SKU tokens.
            if (ContainsQrToken(scanned, "PID", productId))
            {
                return true;
            }
            if (ContainsQrToken(scanned, "PRODUCTID", productId))
            {
                return true;
            }
            if (ContainsQrToken(scanned, "SKU", sku))
            {
                return true;
            }

            // Legacy format example: PRODUCT:{SKU}:{GUID}
            var expectedSkuFromLegacy = ExtractLegacySku(expected);
            if (!string.IsNullOrWhiteSpace(expectedSkuFromLegacy) &&
                ContainsQrToken(scanned, "SKU", expectedSkuFromLegacy))
            {
                return true;
            }

            return false;
        }

        private static string NormalizeQrValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            return value.Trim().Replace("\r", "").Replace("\n", "");
        }

        private static bool ContainsQrToken(string scanned, string tokenName, string expectedValue)
        {
            if (string.IsNullOrWhiteSpace(expectedValue))
            {
                return false;
            }

            var marker = $"{tokenName}:";
            var parts = scanned.Split('|', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                var segment = part.Trim();
                if (!segment.StartsWith(marker, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var tokenValue = segment.Substring(marker.Length).Trim();
                if (string.Equals(tokenValue, expectedValue, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            return false;
        }

        private static string ExtractLegacySku(string expectedQr)
        {
            if (string.IsNullOrWhiteSpace(expectedQr))
            {
                return string.Empty;
            }

            var parts = expectedQr.Split(':', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 2)
            {
                return string.Empty;
            }

            if (!string.Equals(parts[0], "PRODUCT", StringComparison.OrdinalIgnoreCase))
            {
                return string.Empty;
            }

            return parts[1].Trim();
        }

        private static bool IsMatchingBinQr(BinLocation targetBin, string scannedRaw)
        {
            var scanned = NormalizeQrValue(scannedRaw);
            var expected = NormalizeQrValue(targetBin.QrCodeString);

            if (string.IsNullOrWhiteSpace(scanned))
            {
                return false;
            }

            // Exact string match first.
            if (string.Equals(scanned, expected, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Support tokenized QR payloads.
            if (ContainsQrToken(scanned, "BIN", targetBin.BinId))
            {
                return true;
            }
            if (ContainsQrToken(scanned, "BINID", targetBin.BinId))
            {
                return true;
            }
            if (ContainsQrToken(scanned, "LOC", targetBin.BinLocationCode))
            {
                return true;
            }
            if (ContainsQrToken(scanned, "BINLOCATION", targetBin.BinLocationCode))
            {
                return true;
            }

            // Support URL payloads across different hosts/protocols:
            // e.g. http://localhost:5173/binlocation/product/{binId}
            //      https://192.168.x.x:5173/binlocation/product/{binId}
            var scannedBinId = ExtractBinIdFromUrlLikeQr(scanned);
            if (!string.IsNullOrWhiteSpace(scannedBinId) &&
                string.Equals(scannedBinId, targetBin.BinId, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Last fallback: allow direct bin location code scan.
            if (string.Equals(
                scanned,
                NormalizeQrValue(targetBin.BinLocationCode),
                StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return false;
        }

        private static string? ExtractBinIdFromUrlLikeQr(string qrValue)
        {
            if (string.IsNullOrWhiteSpace(qrValue))
            {
                return null;
            }

            var candidate = qrValue.Trim();
            if (!candidate.Contains("://", StringComparison.Ordinal))
            {
                candidate = $"http://{candidate}";
            }

            if (!Uri.TryCreate(candidate, UriKind.Absolute, out var uri))
            {
                return null;
            }

            var segments = uri.AbsolutePath
                .Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (segments.Length == 0)
            {
                return null;
            }

            var maybeId = segments[^1];
            return string.IsNullOrWhiteSpace(maybeId) ? null : maybeId;
        }
    }
}
