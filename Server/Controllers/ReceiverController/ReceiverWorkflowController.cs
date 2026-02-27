using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers.ReceiverController
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiverWorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReceiverWorkflowController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Receiver")]
        [HttpPost("register-received-product")]
        public async Task<ActionResult<ReceiverProductDto>> RegisterReceivedProductAsync(
            [FromBody] RegisterReceivedProductDto dto
        )
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "Receiver";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";
                var normalizedSize = dto.Size.Trim().ToUpperInvariant();

                var selectedBin = await _context.BinLocations
                    .Where(bin =>
                        bin.BinStatus == "Available" &&
                        bin.IsAvailable &&
                        bin.BinSize == normalizedSize &&
                        (bin.BinCapacity - bin.OccupiedQty) >= dto.Quantity
                    )
                    .OrderBy(bin => bin.OccupiedQty)
                    .FirstOrDefaultAsync();

                if (selectedBin == null)
                {
                    return BadRequest(new ApiMessageDto
                    {
                        Message = $"No available bin found for size {normalizedSize} with enough capacity."
                    });
                }

                var newProduct = new Products
                {
                    ProductId = Guid.NewGuid().ToString(),
                    SupplierId = currentUserId ?? string.Empty,
                    ItemQty = dto.Quantity.ToString(),
                    QuantityOnHand = dto.Quantity,
                    SKU = dto.SKU.Trim(),
                    Size = normalizedSize,
                    QrString = $"PRODUCT:{dto.SKU.Trim()}:{Guid.NewGuid()}",
                    CriticalThreshold = GetThresholdBySize(normalizedSize),
                    WorkflowStatus = "PendingPutAway",
                    BinId = selectedBin.BinId,
                    IsBinAssigned = true,
                    DateReceived = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                selectedBin.OccupiedQty += dto.Quantity;
                selectedBin.IsAvailable = selectedBin.OccupiedQty < selectedBin.BinCapacity;
                selectedBin.BinStatus = selectedBin.IsAvailable ? "Available" : "Occupied";
                selectedBin.UpdatedAt = DateTime.UtcNow;

                _context.Products.Add(newProduct);
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = newProduct.ProductId,
                    BinId = selectedBin.BinId,
                    Branch = branchName,
                    Action = "Receive",
                    ToStatus = "PendingPutAway",
                    Quantity = dto.Quantity,
                    PerformedByUserId = currentUserId ?? "N/A",
                    PerformedBy = currentUserName,
                    Description =
                        $"{currentUserName} received {dto.Quantity} units of {dto.SKU} and assigned bin {selectedBin.BinLocationCode}.",
                    OccurredAt = DateTime.UtcNow
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Receive",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =
                        $"{currentUserName} registered received product {dto.SKU} ({dto.Quantity}) to bin {selectedBin.BinLocationCode}.",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                return Ok(new ReceiverProductDto
                {
                    ProductId = newProduct.ProductId,
                    ProductName = dto.ProductName,
                    Supplier = dto.Supplier,
                    SKU = dto.SKU,
                    Size = normalizedSize,
                    Quantity = dto.Quantity,
                    WorkflowStatus = newProduct.WorkflowStatus,
                    BinId = selectedBin.BinId,
                    BinLocation = selectedBin.BinLocationCode,
                    ReceivedAt = newProduct.DateReceived
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

        [Authorize(Roles = "Receiver")]
        [HttpGet("my-logs")]
        public async Task<ActionResult<List<ReceiverLogDto>>> GetMyLogsAsync()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var logs = await _context.StockMovements
                    .Where(movement => movement.PerformedByUserId == currentUserId)
                    .OrderByDescending(movement => movement.OccurredAt)
                    .Select(movement => new ReceiverLogDto
                    {
                        MovementId = movement.MovementId,
                        Action = movement.Action,
                        Description = movement.Description,
                        Quantity = movement.Quantity,
                        ProductId = movement.ProductId,
                        BinId = movement.BinId,
                        OccurredAt = movement.OccurredAt
                    })
                    .ToListAsync();

                return Ok(logs);
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
