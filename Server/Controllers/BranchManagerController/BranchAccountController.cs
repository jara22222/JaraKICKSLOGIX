using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Server.Hubs.BranchManagerHub;
using Server.DTO.BranchAccountDto;
using Server.Models;
using Server.Services;
using Server.Data;  
using System.Security.Claims;
namespace Server.Controllers

{   [Route("api/[controller]")]
    [ApiController]
    public class BranchAccountController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<BranchAccountHub> _hubContext;    
        private readonly ApplicationDbContext _context;

        public BranchAccountController(
            UserManager<Users> user,
            RoleManager<IdentityRole> role,
            IHubContext<BranchAccountHub> hubContext,
            ApplicationDbContext context)
        {
            _userManager = user;
            _roleManager = role;
            _hubContext = hubContext;
            _context = context;
        }
    
        [Authorize(Roles = "BranchManager")]
        [HttpPost("registe-branchAccount")]
        public async Task<IActionResult> PostAsync([FromBody] BranchAccountDto branchAccountDto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";
                var currentUserName = currentUser?.UserName ?? "N/A";
                var firstName = branchAccountDto.FirstName ?? "";
                var lastName = branchAccountDto.LastName ?? "";
                var middleName = branchAccountDto.MiddleName ?? "";
                var accountName = $"{firstName}{middleName}{lastName}".Replace(" ", "");
                var AccountName = branchAccountDto.MiddleName != null
                    ? (branchAccountDto.FirstName ?? "") + branchAccountDto.MiddleName + (branchAccountDto.LastName ?? "")
                    : (branchAccountDto.FirstName ?? "") + (branchAccountDto.LastName ?? "");
                var AccountPassword =  branchAccountDto.LastName + "123";

                
                var newManagerUser = new Users
                {
                    UserName = accountName,
                    Email = branchAccountDto.Email,
                    FirstName = firstName,
                    MiddleName = middleName,
                    LastName = lastName,
                    Branch = branchName, 
                    Address = branchAccountDto.Address ?? "N/A",
                    IsActive = "Active",
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(newManagerUser,"KicksLogix@2026");


                if(result.Succeeded)
                {
                    string roleName = branchAccountDto.RoleName?? "N/A";

                    if(!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole {Name = roleName});
                    }

                    await _userManager.AddToRoleAsync(newManagerUser,roleName);

                    await _hubContext.Clients.All.SendAsync("ReceiveNewBranchUser", new
                    {
                        UserName =accountName,
                        Email = branchAccountDto.Email,
                        IsActive = "Active",
                        Message =  "A new branch manager has joined!"
                    });

                    

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId??"N/A",
                    Action = "Create",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =$"{currentUserName} created branch user: {accountName}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                // 3. Save it to the database
                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();



                    return Ok(new {
                        message= "Branch user created and role assigned successfully!"
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