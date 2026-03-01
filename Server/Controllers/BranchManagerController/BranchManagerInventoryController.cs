using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO.WorkflowDto;

namespace Server.Controllers.BranchManagerController
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchManagerInventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BranchManagerInventoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpGet("items")]
        public async Task<ActionResult<List<BranchManagerInventoryItemDto>>> GetItemsAsync()
        {
            var items = await _context.Inventory
                .GroupJoin(
                    _context.BinLocations,
                    inventory => inventory.BinId,
                    bin => bin.BinId,
                    (inventory, bins) => new { inventory, bins }
                )
                .SelectMany(
                    row => row.bins.DefaultIfEmpty(),
                    (row, bin) => new BranchManagerInventoryItemDto
                    {
                        BinLocation = bin != null ? bin.BinLocationCode : "Unassigned",
                        ProductName = string.IsNullOrWhiteSpace(row.inventory.ProductName)
                            ? row.inventory.SKU
                            : row.inventory.ProductName,
                        Status = row.inventory.WorkflowStatus,
                        SKU = row.inventory.SKU,
                        Size = row.inventory.Size,
                        Quantity = row.inventory.QuantityOnHand
                    }
                )
                .OrderByDescending(item => item.Quantity)
                .Take(500)
                .ToListAsync();

            return Ok(items);
        }
    }
}
