using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.DTO.WorkflowDto;
using Server.Models;

namespace Server.Controllers.BranchManagerController
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchManagerSupplierController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public BranchManagerSupplierController(
            UserManager<Users> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext context
        )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpGet("partners")]
        public async Task<ActionResult<List<SupplierListItemDto>>> GetPartnersAsync()
        {
            var partners = await (
                from user in _userManager.Users
                join userRole in _context.UserRoles on user.Id equals userRole.UserId
                join role in _roleManager.Roles on userRole.RoleId equals role.Id
                where role.Name == "Supplier"
                select new SupplierListItemDto
                {
                    Id = user.Id,
                    CompanyName = user.UserName ?? string.Empty,
                    CompanyAddress = user.Address ?? string.Empty,
                    ContactPerson = user.FirstName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    Status = string.IsNullOrWhiteSpace(user.IsActive) ? "Pending" : user.IsActive,
                    Agreement = user.IsActive == "Active",
                    CreatedAt = user.CreatedAt
                }
            ).OrderByDescending(item => item.CreatedAt).ToListAsync();

            return Ok(partners);
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpGet("replenishment-orders")]
        public async Task<ActionResult<List<BranchManagerSupplierReplenishmentDto>>> GetReplenishmentOrdersAsync()
        {
            var statuses = new[] { "PendingAdminApproval", "PendingReceive", "PendingPutAway" };
            var orders = await _context.Inventory
                .Where(item => statuses.Contains(item.WorkflowStatus))
                .OrderByDescending(item => item.DateReceived)
                .Select(item => new BranchManagerSupplierReplenishmentDto
                {
                    Id = $"PO-{item.ProductId.Substring(0, 8).ToUpper()}",
                    Partner = string.IsNullOrWhiteSpace(item.SupplierName) ? "Unknown Supplier" : item.SupplierName,
                    Items = item.QuantityOnHand,
                    Created = item.DateReceived,
                    Eta = item.DateReceived.AddDays(2),
                    Status = item.WorkflowStatus
                })
                .Take(500)
                .ToListAsync();

            return Ok(orders);
        }
    }
}
