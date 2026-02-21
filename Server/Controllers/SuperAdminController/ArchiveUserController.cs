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
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchiveUserController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<UpdateManagerHub> _hubContext;

        public ArchiveUserController(
            UserManager<Users> user,
            IHubContext<UpdateManagerHub> hubContext,
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

            var user = await _userManager.FindByIdAsync(id);
              if(user == null) return NotFound(new { message = "Manager not found." });
            var previousUser = user.UserName;
          

                     user.IsActive = "InActive";
                     user.UpdatedAt = DateTime.UtcNow;
             

                var result = await _userManager.UpdateAsync(user);


                if(result.Succeeded)
                {
                  
                    var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "System";
                    var currentUserName = User.Identity?.Name ?? "Admin";

                
                var auditLog = new AuditLog
                {
                    UserId = currentUserId,
                    Action = "Archive",
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
        
    }
}