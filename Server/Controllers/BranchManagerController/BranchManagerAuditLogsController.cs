using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using System.Security.Claims;

namespace Server.Controllers.BranchManagerController
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchManagerAuditLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BranchManagerAuditLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("my-branch-logs")]
        public async Task<ActionResult<List<AuditLogListItemDto>>> GetMyBranchLogsAsync()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branch = currentUser?.Branch ?? string.Empty;

                if (string.IsNullOrWhiteSpace(branch))
                {
                    return Ok(new List<AuditLogListItemDto>());
                }

                var logs = await _context.AuditLogs
                    .Where(log => log.Branch == branch)
                    .OrderByDescending(log => log.DatePerformed)
                    .Select(log => new AuditLogListItemDto
                    {
                        Id = log.LogId,
                        UserId = log.UserId,
                        UserName = log.PerformedBy,
                        Action = log.Action,
                        Description = log.Description,
                        Branch = log.Branch ?? branch,
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
