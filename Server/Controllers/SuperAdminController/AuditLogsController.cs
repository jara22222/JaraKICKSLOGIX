using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using System.Security.Claims;

namespace Server.Controllers.SuperAdminController
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("get-audit-logs")]
        public async Task<ActionResult<List<AuditLogListItemDto>>> GetAsync()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User account not found." });
                }

                var roleNames = await (
                    from userRole in _context.UserRoles
                    join role in _context.Roles on userRole.RoleId equals role.Id
                    where userRole.UserId == currentUserId
                    select role.Name ?? string.Empty
                ).ToListAsync();

                var isSuperAdmin = roleNames.Any(role =>
                    string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase));

                var query = _context.AuditLogs.AsQueryable();

                if (!isSuperAdmin)
                {
                    var currentBranch = currentUser?.Branch ?? string.Empty;

                    if (string.IsNullOrWhiteSpace(currentBranch))
                    {
                        return Ok(new List<AuditLogListItemDto>());
                    }

                    query = query.Where(log => log.Branch == currentBranch);
                }

                var logs = await query
                    .OrderByDescending(log => log.DatePerformed)
                    .Select(log => new AuditLogListItemDto
                    {
                        Id = log.LogId,
                        UserId = log.UserId,
                        UserName = log.PerformedBy,
                        Action = log.Action,
                        Description = log.Description,
                        Branch = string.IsNullOrWhiteSpace(log.Branch) ? "Super Admin" : log.Branch ?? "Super Admin",
                        DatePerformed = log.DatePerformed
                    })
                    .ToListAsync();

                return Ok(logs);
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
