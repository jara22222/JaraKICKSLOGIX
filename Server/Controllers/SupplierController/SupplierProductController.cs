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

namespace Server.Controllers.SupplierEndpoints
{
    [ApiController]
    [Route("api/InboundSubmission")]
    public class SupplierProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;

        public SupplierProductController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub
        )
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        [AllowAnonymous]
        [HttpPost("/api/SupplierProduct/submit-product")]
        public Task<ActionResult<object>> SubmitLegacyProductAsync([FromBody] SupplierProductSubmissionDto dto)
            => SubmitProductInternalAsync(dto);

        private async Task<ActionResult<object>> SubmitProductInternalAsync([FromBody] SupplierProductSubmissionDto dto)
        {
            try
            {
                var authUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var authenticatedUser = !string.IsNullOrWhiteSpace(authUserId)
                    ? await _context.Users.FirstOrDefaultAsync(user => user.Id == authUserId)
                    : null;
                var supplierName = string.IsNullOrWhiteSpace(dto.SupplierName)
                    ? (authenticatedUser?.UserName ?? "ExternalSupplier")
                    : dto.SupplierName.Trim();
                var branch = !string.IsNullOrWhiteSpace(dto.Branch)
                    ? dto.Branch!.Trim()
                    : !string.IsNullOrWhiteSpace(authenticatedUser?.Branch)
                    ? authenticatedUser!.Branch
                    : await ResolveDefaultBranchAsync();
                var actorUserId = !string.IsNullOrWhiteSpace(authenticatedUser?.Id)
                    ? authenticatedUser!.Id
                    : await ResolveFallbackUserIdAsync();
                if (string.IsNullOrWhiteSpace(actorUserId))
                {
                    return StatusCode(500, new ApiMessageDto
                    {
                        Message = "No fallback user is available to attach this test supplier submission."
                    });
                }
                var normalizedSku = string.IsNullOrWhiteSpace(dto.SKU)
                    ? BuildDefaultSku(dto.ProductName)
                    : dto.SKU.Trim();
                var normalizedSize = string.IsNullOrWhiteSpace(dto.Size)
                    ? await ResolveSizeFromBinLocationsAsync(dto.Quantity)
                    : dto.Size.Trim().ToUpperInvariant();
                var normalizedProductName = dto.ProductName.Trim();
                var normalizedProductNameUpper = normalizedProductName.ToUpperInvariant();
                var product = await _context.Inventory
                    .Where(item =>
                        item.SupplierId == actorUserId &&
                        item.WorkflowStatus == "PendingAdminApproval" &&
                        !item.IsBinAssigned &&
                        item.SKU == normalizedSku &&
                        item.Size == normalizedSize &&
                        (item.ProductName ?? string.Empty).ToUpper() == normalizedProductNameUpper)
                    .OrderByDescending(item => item.UpdatedAt ?? item.DateReceived)
                    .FirstOrDefaultAsync();

                var isIncrement = product != null;
                if (product == null)
                {
                    product = new Inventory
                    {
                        ProductId = IdGenerator.Create("PRD"),
                        SupplierId = actorUserId,
                        SupplierName = supplierName,
                        ProductName = normalizedProductName,
                        ItemQty = dto.Quantity.ToString(),
                        QuantityOnHand = dto.Quantity,
                        SKU = normalizedSku,
                        Size = normalizedSize,
                        QrString = $"PRODUCT:{normalizedSku}:{IdGenerator.RandomBase36(10)}",
                        CriticalThreshold = GetThresholdBySize(normalizedSize),
                        WorkflowStatus = "PendingAdminApproval",
                        Branch = branch,
                        BinId = null,
                        IsBinAssigned = false,
                        DateReceived = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Inventory.Add(product);
                }
                else
                {
                    product.QuantityOnHand += dto.Quantity;
                    product.ItemQty = product.QuantityOnHand.ToString();
                    product.SupplierName = supplierName;
                    product.Branch = branch;
                    product.UpdatedAt = DateTime.UtcNow;
                }
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.ProductId,
                    Branch = branch,
                    Action = "SupplierSubmit",
                    ToStatus = "PendingAdminApproval",
                    Quantity = dto.Quantity,
                    PerformedByUserId = actorUserId,
                    PerformedBy = supplierName,
                    Description = isIncrement
                        ? $"{supplierName} submitted +{dto.Quantity} units for {normalizedProductName} ({normalizedSku}). Total pending units: {product.QuantityOnHand}."
                        : $"{supplierName} submitted product {normalizedProductName} ({normalizedSku}) qty {dto.Quantity}.",
                    OccurredAt = DateTime.UtcNow
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = actorUserId,
                    Action = "SupplierSubmit",
                    Branch = branch,
                    PerformedBy = supplierName,
                    Description = isIncrement
                        ? $"{supplierName} submitted +{dto.Quantity} units for {normalizedProductName} ({normalizedSku}). Total pending units: {product.QuantityOnHand}."
                        : $"{supplierName} submitted product {normalizedProductName} ({normalizedSku}) qty {dto.Quantity}.",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                await _notificationHub.SendToBranchAndSuperAdminAsync(branch, "InboundShipmentSubmitted", new
                {
                    productId = product.ProductId,
                    sku = product.SKU,
                    size = product.Size,
                    submittedUnits = dto.Quantity,
                    quantity = product.QuantityOnHand,
                    batchQty = CalculateBatchQty(product.QuantityOnHand),
                    branch,
                    supplierName = product.SupplierName,
                    status = product.WorkflowStatus
                });

                return Ok(new
                {
                    message = isIncrement
                        ? "Inbound units submitted and merged into existing pending batch."
                        : "Inbound item submitted successfully.",
                    productId = product.ProductId,
                    sku = product.SKU,
                    size = product.Size,
                    submittedUnits = dto.Quantity,
                    totalUnits = product.QuantityOnHand,
                    batchQty = CalculateBatchQty(product.QuantityOnHand),
                    branch,
                    supplierName = product.SupplierName,
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

        private static string BuildDefaultSku(string productName)
        {
            var compactName = new string(productName
                .ToUpperInvariant()
                .Where(char.IsLetterOrDigit)
                .Take(8)
                .ToArray());
            var prefix = string.IsNullOrWhiteSpace(compactName) ? "ITEM" : compactName;
            return $"{prefix}-{IdGenerator.RandomBase36(6)}";
        }

        private static int CalculateBatchQty(int units)
        {
            if (units <= 0)
            {
                return 0;
            }

            return (int)Math.Ceiling(units / 20d);
        }

        private async Task<string> ResolveSizeFromBinLocationsAsync(int quantity)
        {
            var candidates = await _context.BinLocations
                .Where(bin => bin.BinStatus != "Archived")
                .Select(bin => new
                {
                    Size = bin.BinSize,
                    Remaining = (bin.BinCapacity - bin.OccupiedQty)
                })
                .Where(bin => bin.Remaining > 0)
                .ToListAsync();

            if (!candidates.Any())
            {
                return "M";
            }

            var exactFit = candidates
                .Where(bin => bin.Remaining >= quantity)
                .OrderBy(bin => bin.Remaining)
                .FirstOrDefault();
            if (exactFit != null && !string.IsNullOrWhiteSpace(exactFit.Size))
            {
                return exactFit.Size.Trim().ToUpperInvariant();
            }

            var bestPartial = candidates
                .OrderByDescending(bin => bin.Remaining)
                .First();

            return string.IsNullOrWhiteSpace(bestPartial.Size)
                ? "M"
                : bestPartial.Size.Trim().ToUpperInvariant();
        }

        private async Task<string> ResolveDefaultBranchAsync()
        {
            var branch = await _context.Users
                .Where(user => !string.IsNullOrWhiteSpace(user.Branch))
                .Select(user => user.Branch!)
                .FirstOrDefaultAsync();

            return string.IsNullOrWhiteSpace(branch) ? "N/A" : branch.Trim();
        }

        private async Task<string> ResolveFallbackUserIdAsync()
        {
            var userId = await _context.Users
                .OrderByDescending(user => user.UpdatedAt ?? user.CreatedAt)
                .Select(user => user.Id)
                .FirstOrDefaultAsync();

            return userId ?? string.Empty;
        }
    }
}
