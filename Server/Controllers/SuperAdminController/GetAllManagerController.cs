using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
    [ApiController]
    [Route("api/[controller]")]
    public class GetAllManagerController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<GetAllManagerHub> _hubContext;


        public GetAllManagerController(
            UserManager<Users> user,
            IHubContext<GetAllManagerHub> hubContext,
            RoleManager<IdentityRole> role,
            ApplicationDbContext context)
        {
            _userManager = user;
            _hubContext = hubContext;
            _context = context;
            _roleManager = role;
        }
        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("{get-managers}")]
        public async Task<ActionResult<string>> GetAsync()
        {
            try
            {
                var managers = await (
                    from user in _userManager.Users
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId
                    join role in _roleManager.Roles on userRole.RoleId equals role.Id
                    where role.Name == "BranchManager" && user.IsActive == "Active"
                    select new
                {
                    user.Id, 
                    user.UserName,
                    user.FirstName,
                    user.MiddleName,
                    user.LastName,
                    user.Email,
                    user.Address,
                    user.IsActive,
                    role.Name                                
                }
            ).ToListAsync();

         
                await _hubContext.Clients.All.SendAsync("Retrived All Managers",managers);
            
            
            return Ok(managers);

            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new {
                    message = "An internal server error occurred.",
                    systemError = ex.Message,
                    details = ex.InnerException?.Message });
            }
            
        }
    }
}