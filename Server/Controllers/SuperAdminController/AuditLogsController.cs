using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;

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

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("get-audit-logs")]
        public async Task<ActionResult<List<AuditLogListItemDto>>> GetAsync()
        {
            try
            {
                var logs = await _context.AuditLogs
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
