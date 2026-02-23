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
    public class ManagerAccountController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<SupplierHub> _hubContext;    
        private readonly ApplicationDbContext _context;

        public ManagerAccountController(
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
        [HttpPost("register-manager")]
        public async Task<IActionResult> PostAsync([FromBody] ManagerDto managerDto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";
                var ManagerUser = managerDto.MiddleName != null
                    ? (managerDto.FirstName ?? "") + managerDto.MiddleName + (managerDto.LastName ?? "")
                    : (managerDto.FirstName ?? "") + (managerDto.LastName ?? "");
                var newManagerUser = new Users
                {
                    UserName = ManagerUser.Replace(" ",""),
                    Email = managerDto.Email,
                    FirstName = managerDto.FirstName ?? "N/A",
                    MiddleName = managerDto.MiddleName ?? "",
                    LastName = managerDto.LastName ?? "N/A",
                    Branch = managerDto.Branch ?? "N/A",
                    Address = managerDto.Address ?? "N/A",
                    IsActive = "Active",
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(newManagerUser, "Manager@2026");


                if(result.Succeeded)
                {
                    string roleName = "BranchManager";

                    if(!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole {Name = roleName});
                    }

                    await _userManager.AddToRoleAsync(newManagerUser,roleName);

                    await _hubContext.Clients.All.SendAsync("ReceiveNewBranchManager", new
                    {
                        UserName =ManagerUser,
                        Email = managerDto.Email,
                        IsActive = "Active",
                        Message =  "A new branch manager has joined!"
                    });

                     
                    var currentUserName = User.Identity?.Name ?? "Admin";

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Create",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =$"{currentUserName} created branch manager: {ManagerUser}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                // 3. Save it to the database
                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();



                    return Ok(new {
                        message= "Branch Manager account created and role assigned successfully!"
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