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
    public class BranchNotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BranchNotificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "BranchManager")]
        [HttpGet("my-notifications")]
        public async Task<ActionResult<List<object>>> GetMyNotificationsAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var notifications = await _context.BranchNotifications
                .Where(notification => notification.RecipientUserId == userId)
                .OrderByDescending(notification => notification.CreatedAt)
                .Select(notification => new
                {
                    notification.NotificationId,
                    notification.Type,
                    notification.Size,
                    notification.Message,
                    notification.IsRead,
                    notification.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("mark-read/{notificationId}")]
        public async Task<ActionResult<ApiMessageDto>> MarkReadAsync(string notificationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var notification = await _context.BranchNotifications
                .FirstOrDefaultAsync(item => item.NotificationId == notificationId && item.RecipientUserId == userId);
            if (notification == null)
            {
                return NotFound(new ApiMessageDto { Message = "Notification not found." });
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new ApiMessageDto { Message = "Notification marked as read." });
        }
    }
}
