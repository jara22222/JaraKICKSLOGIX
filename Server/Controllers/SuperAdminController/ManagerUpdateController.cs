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
    public class ManagerUpdateContoller:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ArchiveUserHub> _hubContext;    
   

        public ManagerUpdateContoller(
            UserManager<Users> user,
            IHubContext<ArchiveUserHub> hubContext,
            ApplicationDbContext context)
        {
            _userManager = user;
            _hubContext = hubContext;
            _context = context;
        }
    
        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("update-manager/{id}")]
        //COMTOLLER
        public async Task<IActionResult> PostAsync([FromRoute] string id,[FromBody] UpdateManagerDto UpdatemanagerDto)
        {
            try
            {

            var user = await _userManager.FindByIdAsync(id);
              if(user == null) return NotFound(new { message = "Manager not found." });
            var previousUser = user.UserName;
          


               var ManagerUser = UpdatemanagerDto.MiddleName != null
                    ? (UpdatemanagerDto.FirstName ?? "") + UpdatemanagerDto.MiddleName + (UpdatemanagerDto.LastName ?? "")
                    : (UpdatemanagerDto.FirstName ?? "") + (UpdatemanagerDto.LastName ?? "");
               
                     user.UserName = ManagerUser.Replace(" ","");
                     user.Email = UpdatemanagerDto.Email;
                     user.FirstName = UpdatemanagerDto.FirstName ?? "N/A";
                     user.MiddleName = UpdatemanagerDto.MiddleName ?? "N/A";
                     user.LastName = UpdatemanagerDto.LastName ?? "N/A";
                     user.Branch = UpdatemanagerDto.Branch ?? "N/A";
                     user.Address = UpdatemanagerDto.Address ?? "N/A";
                     user.IsActive = UpdatemanagerDto.IsActive ?? "N/A";
                     user.EmailConfirmed = true;
                     user.UpdatedAt = DateTime.UtcNow;
             

                var result = await _userManager.UpdateAsync(user);


                if(result.Succeeded)
                {
                  
                    var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "System";
                    var currentUserName = User.Identity?.Name ?? "Admin";

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId,
                    Action = "Update",
                    PerformedBy = currentUserName,
                    Description =$"{currentUserName} updated branch manager: {previousUser} to {ManagerUser}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                   
                    _context.AuditLogs.Add(auditLog);
                    await _context.SaveChangesAsync();



                    return Ok(new {
                        message= "Branch Manager account updated successfully!"
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