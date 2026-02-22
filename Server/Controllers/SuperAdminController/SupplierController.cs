using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Server.Hubs;
using Server.DTO;
using Server.Models;
using Server.Services;
using Server.Data;  
using System.Security.Claims;
namespace Server.Controllers

{   [Route("api/[controller]")]
    [ApiController]
    public class SupplierController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<SupplierHub> _hubContext;    
        private readonly ApplicationDbContext _context;

        public SupplierController(
            UserManager<Users> user,
            RoleManager<IdentityRole> role,
            IHubContext<SupplierHub> hubContext,
            ApplicationDbContext context)
        {
            _userManager = user;
            _roleManager = role;
            _hubContext = hubContext;
            _context = context;
        }
    
        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("register-supplier")]
        public async Task<IActionResult> PostAsync([FromBody] SupplierDto supplierDto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";

                var newSupplierUser = new Users
                {
                    UserName = supplierDto.CompanyName,
                    Email = supplierDto.Email,
                    FirstName = "Supplier",
                    LastName = "Supplier",
                    Address =  supplierDto.CompanyAddress,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(newSupplierUser, "Supplier@2026");


                if(result.Succeeded)
                {
                    string roleName = "Supplier";

                    if(!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole {Name = roleName});
                    }
                    await _userManager.AddToRoleAsync(newSupplierUser,roleName);

                    await _hubContext.Clients.All.SendAsync("ReceiveNewSupplier", new
                    {
                        CompanyName = supplierDto.CompanyName,
                        Email = supplierDto.Email,
                        Message =  "A new supplier has joined!"
                    });

                
                var currentUserName = User.Identity?.Name ?? "Admin";

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Create",
                    PerformedBy = currentUserName,
                    Branch=branchName,
                    Description =$"{currentUserName} created supplier: {supplierDto.CompanyName}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                // 3. Save it to the database
                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();



                    return Ok(new {
                        message= "Supplier account created and role assigned successfully!"
                    });
                }
                return BadRequest(result.Errors);
            }
            catch (System.Exception ex)
            {
                 // TODO
                 return StatusCode(500, new {
                    message = "An internal server error occurred.",
                    systemError = ex.Message,
                    details = ex.InnerException?.Message });
            }
        }
        
    }
}