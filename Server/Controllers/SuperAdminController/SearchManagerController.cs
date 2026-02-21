using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Server.Hubs;
using Server.DTO;
using Server.Models;
using Server.Services;
using Server.Data;  
using System.Security.Claims;
namespace Server.Controllers.SuperAdminController
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchManagerController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<SearchManagerHub> _hubContext;    
        private readonly ApplicationDbContext _context;

        public SearchManagerController(
            UserManager<Users> user,
            IHubContext<SearchManagerHub> hubContext,
            RoleManager<IdentityRole> role,
            ApplicationDbContext context)
        {
            _userManager = user;
            _hubContext = hubContext;
            _context = context;
            _roleManager = role;
        }

        [HttpGet("search-manager/{query}")]
        public async Task<IActionResult> GetAsync(string query)
        {
            try
            {
            
            if (string.IsNullOrWhiteSpace(query)) 
                    return BadRequest(new { message = "Search query cannot be empty." });

            var searchTerm = query.ToLower();

            var results = await (
                from user in _userManager.Users
                join userRole in _context.UserRoles on user.Id equals userRole.UserId
                join role in _roleManager.Roles on userRole.RoleId equals role.Id
                where role.Name == "BranchManager"  && user.IsActive == "Active" && (
                    (user.FirstName ?? "N/A").ToLower().Contains(searchTerm) || 
                    (user.MiddleName ?? "N/A").ToLower().Contains(searchTerm) || 
                    (user.Branch ?? "N/A").ToLower().Contains(searchTerm) || 
                    (user.LastName ??"N/A").ToLower().Contains(searchTerm) || 
                    (user.UserName ?? "N/A").ToLower().Contains(searchTerm) ||
                    (user.Email ?? "N/A").ToLower().Contains(searchTerm)
            )
            select new
            {
                user.Id,
                user.UserName,
                user.FirstName,
                user.MiddleName,
                user.LastName,
                user.Email,
                user.IsActive,
                RoleName = role.Name
            }
        ).ToListAsync();

        await _hubContext.Clients.All.SendAsync("OnSearchPerformed", results);
        
        return Ok(results);
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