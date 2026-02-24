using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Hubs;
using Server.DTO;
using Server.Models;
using Server.Services;
using Server.Data;  
using System.Security.Claims;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchiveUserController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ArchiveUserHub> _hubContext;

        public ArchiveUserController(
            UserManager<Users> user,
            IHubContext<ArchiveUserHub> hubContext,
            ApplicationDbContext context)
        {
            _userManager = user;
            _hubContext = hubContext;
            _context = context;
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("archive-manager/{id}")]
        //COMTOLLER
        public async Task<IActionResult> PostAsync([FromRoute] string id)
        {
            try
            {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
            var branchName = currentUser?.Branch ?? "N/A";

            var user = await _userManager.FindByIdAsync(id);
              if(user == null) return NotFound(new { message = "Manager not found." });
            var previousUser = user.UserName;
          

                     user.IsActive = "InActive";
                     user.UpdatedAt = DateTime.UtcNow;
             

                var result = await _userManager.UpdateAsync(user);


                if(result.Succeeded)
                {
                    var managerHubEvent = new ManagerHubEventDto
                    {
                        UserId = user.Id,
                        UserName = user.UserName ?? previousUser ?? "Unknown",
                        Email = user.Email ?? string.Empty,
                        Branch = user.Branch ?? "N/A",
                        Status = "InActive",
                        Message = "Branch manager archived."
                    };
                    await _hubContext.Clients.All.SendAsync("ManagerArchived", managerHubEvent);
                    
                    var currentUserName = User.Identity?.Name ?? "Admin";

                
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Archive",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =$"{currentUserName} Archive branch manager: {previousUser}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                   
                    _context.AuditLogs.Add(auditLog);
                    await _context.SaveChangesAsync();



                    return Ok(new {
                        message= "Branch Manager account Archive successfully!"
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
        
        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("restore-manager/{id}")]
        public async Task<IActionResult> RestoreManagerAsync([FromRoute] string id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";
                var user = await _userManager.FindByIdAsync(id);
                if (user == null) return NotFound(new { message = "Manager not found." });
                var previousUser = user.UserName ?? "Unknown";

                user.IsActive = "Active";
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded) return BadRequest(result.Errors);

                var managerHubEvent = new ManagerHubEventDto
                {
                    UserId = user.Id,
                    UserName = user.UserName ?? previousUser,
                    Email = user.Email ?? string.Empty,
                    Branch = user.Branch ?? "N/A",
                    Status = "Active",
                    Message = "Branch manager restored."
                };
                await _hubContext.Clients.All.SendAsync("ManagerRestored", managerHubEvent);

                var currentUserName = User.Identity?.Name ?? "Admin";
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Restore",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description = $"{currentUserName} restored branch manager: {previousUser}",
                    DatePerformed = DateTime.UtcNow
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Branch Manager account restored successfully!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An internal server error occurred.",
                    systemError = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
        
        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("archived-managers")]
        public async Task<IActionResult> GetArchivedManagersAsync()
        {
            try
            {
                var archivedManagers = await (
                    from user in _userManager.Users
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId
                    join role in _context.Roles on userRole.RoleId equals role.Id
                    where role.Name == "BranchManager" &&
                          (user.IsActive == "InActive" || user.IsActive == "Inactive" || user.IsActive == "Archived")
                    select new
                    {
                        user.Id,
                        user.UserName,
                        user.FirstName,
                        user.MiddleName,
                        user.LastName,
                        user.Email,
                        user.Address,
                        user.Branch,
                        user.IsActive,
                        user.CreatedAt
                    }
                ).ToListAsync();

                return Ok(archivedManagers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An internal server error occurred.",
                    systemError = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
        
    }
}