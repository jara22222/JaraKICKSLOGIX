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
    public class BranchManagerInventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;
        private const int BatchUnitSize = 20;

        public BranchManagerInventoryController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub)
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpGet("items")]
        public async Task<ActionResult<List<BranchManagerInventoryItemDto>>> GetItemsAsync()
        {
            var inventoryItems = await _context.Inventory
                .Where(item => item.WorkflowStatus != "Archived")
                .Take(500)
                .ToListAsync();

            var binIds = inventoryItems
                .Where(item => !string.IsNullOrWhiteSpace(item.BinId))
                .Select(item => item.BinId!)
                .Distinct()
                .ToList();
            var productIds = inventoryItems
                .Select(item => item.ProductId)
                .Distinct()
                .ToList();

            var binsById = await _context.BinLocations
                .Where(bin => binIds.Contains(bin.BinId))
                .ToDictionaryAsync(bin => bin.BinId, bin => new
                {
                    bin.BinLocationCode,
                    bin.BinStatus
                });

            var putawayActions = new[] { "StoreInBin", "ScanBin", "ScanItem" };
            var putawayByProduct = await _context.StockMovements
                .Where(movement =>
                    movement.ProductId != null &&
                    productIds.Contains(movement.ProductId) &&
                    putawayActions.Contains(movement.Action))
                .GroupBy(movement => movement.ProductId!)
                .Select(group => new
                {
                    ProductId = group.Key,
                    PutedAt = group.Max(movement => movement.OccurredAt)
                })
                .ToDictionaryAsync(item => item.ProductId, item => item.PutedAt);

            var lowStockApprovalsByProduct = await _context.StockMovements
                .Where(movement =>
                    movement.ProductId != null &&
                    productIds.Contains(movement.ProductId) &&
                    movement.Action == "ApproveLowStockReplenishment")
                .GroupBy(movement => movement.ProductId!)
                .Select(group => new
                {
                    ProductId = group.Key,
                    ApprovedAt = group.Max(movement => movement.OccurredAt)
                })
                .ToDictionaryAsync(item => item.ProductId, item => item.ApprovedAt);

            var items = inventoryItems
                .Select(item =>
                {
                    var totalQty = item.QuantityOnHand;
                    var batchQty = CalculateBatchSlots(totalQty);
                    var putedAt = putawayByProduct.TryGetValue(item.ProductId, out var puted)
                        ? puted
                        : item.DateReceived;
                    var updatedAt = item.UpdatedAt ?? item.DateReceived;
                    var threshold = item.CriticalThreshold ?? 5;
                    var isLowStock = totalQty <= threshold;
                    var isApproved = isLowStock &&
                                     lowStockApprovalsByProduct.TryGetValue(item.ProductId, out var approvedAt) &&
                                     approvedAt >= updatedAt;

                    return new BranchManagerInventoryItemDto
                    {
                        ProductId = item.ProductId,
                        BinLocation = !string.IsNullOrWhiteSpace(item.BinId) &&
                                      binsById.TryGetValue(item.BinId!, out var binInfo)
                            ? binInfo.BinLocationCode
                            : "Unassigned",
                        BinStatus = !string.IsNullOrWhiteSpace(item.BinId) &&
                                    binsById.TryGetValue(item.BinId!, out var matchedBinInfo)
                            ? (string.IsNullOrWhiteSpace(matchedBinInfo.BinStatus) ? "Unknown" : matchedBinInfo.BinStatus)
                            : "Unassigned",
                        SKU = item.SKU ?? string.Empty,
                        SupplierName = item.SupplierName ?? "Unknown Supplier",
                        ItemBatchName = string.IsNullOrWhiteSpace(item.ProductName)
                            ? item.SKU
                            : item.ProductName,
                        BatchQty = batchQty,
                        TotalProductQty = totalQty,
                        Size = item.Size,
                        DatePuted = putedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        DateUpdated = updatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        LowStockStatus = isLowStock ? "Low Stock" : "Healthy",
                        LowStockApprovalStatus = isLowStock
                            ? (isApproved ? "Approved" : "Pending Approval")
                            : "N/A"
                    };
                })
                .OrderBy(item => item.LowStockStatus == "Low Stock" ? 0 : 1)
                .ThenByDescending(item => item.TotalProductQty)
                .ToList();

            return Ok(items);
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpPut("approve-low-stock/{productId}")]
        public async Task<ActionResult<ApiMessageDto>> ApproveLowStockAsync(string productId)
        {
            var product = await _context.Inventory.FirstOrDefaultAsync(item => item.ProductId == productId);
            if (product == null)
            {
                return NotFound(new ApiMessageDto { Message = "Inventory item not found." });
            }

            var threshold = product.CriticalThreshold ?? 5;
            if (product.QuantityOnHand > threshold)
            {
                return BadRequest(new ApiMessageDto
                {
                    Message = "This item is not currently in low stock."
                });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
            var performedBy = User.Identity?.Name ?? currentUser?.UserName ?? "BranchManager";
            var branch = currentUser?.Branch ?? "N/A";

            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.ProductId,
                BinId = product.BinId,
                Branch = branch,
                Action = "ApproveLowStockReplenishment",
                FromStatus = product.WorkflowStatus,
                ToStatus = product.WorkflowStatus,
                Quantity = product.QuantityOnHand,
                PerformedByUserId = string.IsNullOrWhiteSpace(currentUserId) ? "N/A" : currentUserId,
                PerformedBy = performedBy,
                Description = $"{performedBy} approved low-stock replenishment for {product.SKU} ({product.Size}).",
                OccurredAt = DateTime.UtcNow
            });

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = string.IsNullOrWhiteSpace(currentUserId) ? "N/A" : currentUserId,
                Action = "ApproveLowStockReplenishment",
                Branch = branch,
                PerformedBy = performedBy,
                Description = $"{performedBy} approved low-stock replenishment for {product.SKU} ({product.Size}) qty {product.QuantityOnHand}.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await _notificationHub.SendToBranchAndSuperAdminAsync(branch, "InboundQueueUpdated", new
            {
                productId = product.ProductId,
                sku = product.SKU,
                size = product.Size,
                status = product.WorkflowStatus,
                updatedAt = DateTime.UtcNow
            });
            await _notificationHub.SendToBranchAndSuperAdminAsync(branch, "LowStockAlert", new
            {
                branch,
                product.SKU,
                product.Size,
                product.QuantityOnHand,
                threshold
            });
            return Ok(new ApiMessageDto
            {
                Message = "Low-stock replenishment approved successfully."
            });
        }

        private static int CalculateBatchSlots(int quantity)
        {
            if (quantity <= 0)
            {
                return 0;
            }

            return (int)Math.Ceiling(quantity / (double)BatchUnitSize);
        }
    }
}
