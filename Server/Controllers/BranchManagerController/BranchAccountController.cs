using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.WebUtilities;
using Server.Hubs.BranchManagerHub;
using Server.DTO.BranchAccountDto;
using Server.Models;
using Server.Services;
using Server.Data;  
using System.Security.Claims;
using System.Text;
namespace Server.Controllers

{   [Route("api/[controller]")]
    [ApiController]
    public class BranchAccountController:ControllerBase
    {
        private static readonly HashSet<string> AllowedBranchRoles =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "Receiver",
                "PutAway",
                "VASPersonnel",
                "DispatchClerk"
            };
        private const string BranchManagerRole = "BranchManager";

        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<BranchAccountHub> _hubContext;    
        private readonly ApplicationDbContext _context;
        private readonly IEmailSenderService _emailSenderService;
        private readonly IConfiguration _configuration;

        public BranchAccountController(
            UserManager<Users> user,
            RoleManager<IdentityRole> role,
            IHubContext<BranchAccountHub> hubContext,
            ApplicationDbContext context,
            IEmailSenderService emailSenderService,
            IConfiguration configuration)
        {
            _userManager = user;
            _roleManager = role;
            _hubContext = hubContext;
            _context = context;
            _emailSenderService = emailSenderService;
            _configuration = configuration;
        }
    
        [Authorize(Roles = "BranchManager")]
        [HttpPost("registe-branchAccount")]
        [HttpPost("create-employee")]
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
                var accountName = await BuildUniqueUserNameAsync(lastName);
                const string defaultPassword = "KicksLogix@2026";

                
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

                var requestedRole = branchAccountDto.RoleName?.Trim() ?? string.Empty;
                if (!AllowedBranchRoles.Contains(requestedRole))
                {
                    return BadRequest(new
                    {
                        message = "Invalid role. Allowed roles are Receiver, PutAway, VASPersonnel, and DispatchClerk."
                    });
                }

                var result = await _userManager.CreateAsync(newManagerUser, defaultPassword);


                if(result.Succeeded)
                {
                    string roleName = requestedRole;

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
                        Role = roleName,
                        Message =  "A new branch employee has joined!"
                    });

                    var clientBaseUrl =
                        _configuration["App:ClientBaseUrl"] ??
                        _configuration["ClientBaseUrl"] ??
                        "https://localhost:5173";
                    var token = await _userManager.GeneratePasswordResetTokenAsync(newManagerUser);
                    var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
                    var resetLink = $"{clientBaseUrl.TrimEnd('/')}/reset-password?uid={Uri.EscapeDataString(newManagerUser.Id)}&token={Uri.EscapeDataString(encodedToken)}";

                    var safeDisplayName = $"{newManagerUser.FirstName} {newManagerUser.LastName}".Trim();
                    if (string.IsNullOrWhiteSpace(safeDisplayName))
                    {
                        safeDisplayName = "User";
                    }
                    var onboardingBody = $@"
<div style='font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;'>
  <h2 style='margin-bottom: 8px;'>Welcome to KicksLogix</h2>
  <p>Hello {safeDisplayName},</p>
  <p>Your branch account has been created by Branch Admin. For security, reset your password now before first use.</p>
  <p><strong>Username:</strong> {newManagerUser.UserName}</p>
  <p><strong>Default Password:</strong> {defaultPassword}</p>
  <p>
    <a href='{resetLink}' style='display: inline-block; padding: 10px 16px; background: #001F3F; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700;'>
      Reset Password Now
    </a>
  </p>
</div>";

                    await _emailSenderService.SendAsync(
                        newManagerUser.Email ?? string.Empty,
                        "KicksLogix Account Created - Reset Password Now",
                        onboardingBody);

                    

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId??"N/A",
                    Action = "Create",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =$"{currentUserName} created branch employee ({roleName}): {accountName}",
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

        private async Task<string> BuildUniqueUserNameAsync(string lastName)
        {
            var normalizedLastName = new string(
                (lastName ?? string.Empty)
                    .Where(char.IsLetterOrDigit)
                    .ToArray());
            if (string.IsNullOrWhiteSpace(normalizedLastName))
            {
                normalizedLastName = "User";
            }

            var baseUserName = $"{normalizedLastName}KicksLogix";
            var candidate = baseUserName;
            var suffix = 1;

            while (await _userManager.FindByNameAsync(candidate) != null)
            {
                candidate = $"{baseUserName}{suffix}";
                suffix += 1;
            }

            return candidate;
        }

        [Authorize(Roles = "BranchManager")]
        [HttpGet("branch-employees")]
        public async Task<ActionResult<List<BranchAccountListItemDto>>> GetBranchEmployeesAsync()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var currentUser = await _userManager.FindByIdAsync(currentUserId);
                var currentBranch = currentUser?.Branch ?? string.Empty;

                if (string.IsNullOrWhiteSpace(currentBranch))
                {
                    return Ok(new List<BranchAccountListItemDto>());
                }

                var allowedRoles = AllowedBranchRoles.ToList();

                var employees = await (
                    from user in _userManager.Users
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId
                    join role in _context.Roles on userRole.RoleId equals role.Id
                    where user.Branch == currentBranch && allowedRoles.Contains(role.Name!)
                    select new BranchAccountListItemDto
                    {
                        Id = user.Id,
                        FirstName = user.FirstName ?? string.Empty,
                        MiddleName = user.MiddleName ?? string.Empty,
                        LastName = user.LastName ?? string.Empty,
                        Email = user.Email ?? string.Empty,
                        RoleName = role.Name ?? string.Empty,
                        Branch = user.Branch ?? string.Empty,
                        Status = string.IsNullOrWhiteSpace(user.IsActive) ? "Active" : user.IsActive,
                        LastActiveAt = (user.UpdatedAt ?? user.CreatedAt).ToString("o")
                    }
                ).ToListAsync();

                var activeEmployees = employees
                    .Where(employee =>
                        !string.Equals(employee.Status, "Inactive", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(employee.Status, "Archived", StringComparison.OrdinalIgnoreCase))
                    .OrderBy(employee => employee.LastName)
                    .ThenBy(employee => employee.FirstName)
                    .ToList();

                return Ok(activeEmployees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to fetch branch employees.",
                    systemError = ex.Message
                });
            }
        }

        [Authorize(Roles = "BranchManager")]
        [HttpGet("archived-employees")]
        public async Task<ActionResult<List<BranchAccountListItemDto>>> GetArchivedBranchEmployeesAsync()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var currentUser = await _userManager.FindByIdAsync(currentUserId);
                var currentBranch = currentUser?.Branch ?? string.Empty;

                if (string.IsNullOrWhiteSpace(currentBranch))
                {
                    return Ok(new List<BranchAccountListItemDto>());
                }

                var allowedRoles = AllowedBranchRoles.ToList();

                var employees = await (
                    from user in _userManager.Users
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId
                    join role in _context.Roles on userRole.RoleId equals role.Id
                    where user.Branch == currentBranch && allowedRoles.Contains(role.Name!)
                    select new BranchAccountListItemDto
                    {
                        Id = user.Id,
                        FirstName = user.FirstName ?? string.Empty,
                        MiddleName = user.MiddleName ?? string.Empty,
                        LastName = user.LastName ?? string.Empty,
                        Email = user.Email ?? string.Empty,
                        RoleName = role.Name ?? string.Empty,
                        Branch = user.Branch ?? string.Empty,
                        Status = string.IsNullOrWhiteSpace(user.IsActive) ? "Archived" : user.IsActive,
                        LastActiveAt = (user.UpdatedAt ?? user.CreatedAt).ToString("o")
                    }
                ).ToListAsync();

                var archivedEmployees = employees
                    .Where(employee =>
                        string.Equals(employee.Status, "Inactive", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(employee.Status, "Archived", StringComparison.OrdinalIgnoreCase))
                    .OrderBy(employee => employee.LastName)
                    .ThenBy(employee => employee.FirstName)
                    .ToList();

                return Ok(archivedEmployees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to fetch archived branch employees.",
                    systemError = ex.Message
                });
            }
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("archive-employee/{id}")]
        public async Task<IActionResult> ArchiveEmployeeAsync([FromRoute] string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            var currentUserName = currentUser?.UserName ?? "BranchManager";

            var targetUser = await _userManager.FindByIdAsync(id);
            if (targetUser == null)
            {
                return NotFound(new { message = "Employee not found." });
            }

            if (!string.Equals(targetUser.Branch, currentBranch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var targetRoles = await _userManager.GetRolesAsync(targetUser);
            if (!targetRoles.Any(role => AllowedBranchRoles.Contains(role)))
            {
                return BadRequest(new { message = "Only branch employees can be archived by Branch Manager." });
            }

            targetUser.IsActive = "Archived";
            targetUser.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(targetUser);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "Archive",
                Branch = currentBranch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} archived branch employee: {targetUser.UserName}",
                DatePerformed = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BranchUserStatusChanged", new
            {
                userId = targetUser.Id,
                status = targetUser.IsActive,
                branch = currentBranch,
                updatedAt = DateTime.UtcNow
            });

            return Ok(new { message = "Branch employee archived successfully." });
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("restore-employee/{id}")]
        public async Task<IActionResult> RestoreEmployeeAsync([FromRoute] string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            var currentUserName = currentUser?.UserName ?? "BranchManager";

            var targetUser = await _userManager.FindByIdAsync(id);
            if (targetUser == null)
            {
                return NotFound(new { message = "Employee not found." });
            }

            if (!string.Equals(targetUser.Branch, currentBranch, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var targetRoles = await _userManager.GetRolesAsync(targetUser);
            if (!targetRoles.Any(role => AllowedBranchRoles.Contains(role)))
            {
                return BadRequest(new { message = "Only branch employees can be restored by Branch Manager." });
            }

            targetUser.IsActive = "Active";
            targetUser.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(targetUser);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "Restore",
                Branch = currentBranch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} restored branch employee: {targetUser.UserName}",
                DatePerformed = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BranchUserStatusChanged", new
            {
                userId = targetUser.Id,
                status = targetUser.IsActive,
                branch = currentBranch,
                updatedAt = DateTime.UtcNow
            });

            return Ok(new { message = "Branch employee restored successfully." });
        }

        [Authorize(Roles = "BranchManager")]
        [HttpGet("password-reset-requests")]
        public async Task<ActionResult<List<BranchPasswordResetRequestDto>>> GetPasswordResetRequestsAsync()
        {
            var requests = await _context.BranchPasswordResetRequests
                .OrderByDescending(request => request.RequestedAt)
                .Take(200)
                .Select(request => new BranchPasswordResetRequestDto
                {
                    RequestId = request.RequestId,
                    UserId = request.UserId,
                    Branch = request.Branch,
                    UserEmail = request.UserEmail,
                    UserName = request.UserEmail,
                    RequestedByFirstName = request.RequestedByFirstName,
                    RequestedByLastName = request.RequestedByLastName,
                    RequestedByEmail = request.RequestedByEmail,
                    RequestedByAddress = request.RequestedByAddress,
                    RequestedRoleName = request.RequestedRoleName,
                    Status = request.Status,
                    RequestedAt = request.RequestedAt.ToString("o"),
                    ReviewedAt = request.ReviewedAt.HasValue ? request.ReviewedAt.Value.ToString("o") : null,
                    ReviewedByUserName = request.ReviewedByUserName,
                    ReviewRemarks = request.ReviewRemarks
                })
                .ToListAsync();

            return Ok(requests);
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("password-reset-requests/{requestId}/confirm")]
        public async Task<IActionResult> ConfirmPasswordResetRequestAsync(
            [FromRoute] string requestId,
            [FromBody] ReviewPasswordResetRequestDto? dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            var currentUserName = currentUser?.UserName ?? "BranchManager";

            var request = await _context.BranchPasswordResetRequests
                .FirstOrDefaultAsync(item => item.RequestId == requestId && item.Branch == currentBranch);

            if (request == null)
            {
                return NotFound(new { message = "Password reset request not found." });
            }

            if (!string.Equals(request.Status, "PendingApproval", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only pending requests can be confirmed." });
            }
            if (!AllowedBranchRoles.Contains(request.RequestedRoleName))
            {
                return BadRequest(new { message = "This request must be reviewed by Super Admin." });
            }

            var targetUser = await _userManager.FindByIdAsync(request.UserId);
            if (targetUser == null)
            {
                request.Status = "Rejected";
                request.ReviewedAt = DateTime.UtcNow;
                request.ReviewedByUserId = currentUserId;
                request.ReviewedByUserName = currentUserName;
                request.ReviewRemarks = "User account no longer exists.";
                await _context.SaveChangesAsync();
                return BadRequest(new { message = "Target user account no longer exists." });
            }

            var clientBaseUrl =
                _configuration["App:ClientBaseUrl"] ??
                _configuration["ClientBaseUrl"] ??
                "https://localhost:5173";
            var resetLink = $"{clientBaseUrl.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(targetUser.Email ?? request.UserEmail)}";

            var fullName = $"{targetUser.FirstName} {targetUser.LastName}".Trim();
            var safeDisplayName = string.IsNullOrWhiteSpace(fullName) ? "User" : fullName;
            var emailBody = $@"
<div style='font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;'>
  <h2 style='margin-bottom: 8px;'>Password Reset Request Approved</h2>
  <p>Hello {safeDisplayName},</p>
  <p>Your Branch Manager approved your password reset request. Click the secure link below to set a new password.</p>
  <p>
    <a href='{resetLink}' style='display: inline-block; padding: 10px 16px; background: #001F3F; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700;'>
      Reset Password
    </a>
  </p>
  <p>This link can only be used once.</p>
  <p>If you did not request this change, contact your Branch Manager immediately.</p>
</div>";

            bool emailSent;
            try
            {
                emailSent = await _emailSenderService.SendAsync(
                    targetUser.Email ?? request.UserEmail,
                    "KicksLogix Password Reset",
                    emailBody);
            }
            catch (InvalidOperationException emailEx)
            {
                return BadRequest(new
                {
                    message = "Unable to send reset email via Resend. Verify API key and sender configuration, then try again.",
                    providerError = emailEx.Message
                });
            }

            request.Status = "Approved";
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedByUserId = currentUserId;
            request.ReviewedByUserName = currentUserName;
            request.ReviewRemarks = string.IsNullOrWhiteSpace(dto?.Remarks) ? "Approved by Branch Manager." : dto!.Remarks;
            request.ResetLinkSentAt = DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "ApprovePasswordReset",
                Branch = currentBranch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} approved password reset request for {targetUser.UserName}",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            if (!emailSent)
            {
                return Ok(new
                {
                    message = "Request approved, but Resend API key is not configured in Development. Email was not sent.",
                    resetLinkPreview = resetLink
                });
            }

            return Ok(new { message = "Request approved and reset link sent to user email." });
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPut("password-reset-requests/{requestId}/reject")]
        public async Task<IActionResult> RejectPasswordResetRequestAsync(
            [FromRoute] string requestId,
            [FromBody] ReviewPasswordResetRequestDto? dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var currentBranch = currentUser?.Branch ?? string.Empty;
            var currentUserName = currentUser?.UserName ?? "BranchManager";

            var request = await _context.BranchPasswordResetRequests
                .FirstOrDefaultAsync(item => item.RequestId == requestId && item.Branch == currentBranch);

            if (request == null)
            {
                return NotFound(new { message = "Password reset request not found." });
            }

            if (!string.Equals(request.Status, "PendingApproval", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only pending requests can be rejected." });
            }
            if (!AllowedBranchRoles.Contains(request.RequestedRoleName))
            {
                return BadRequest(new { message = "This request must be reviewed by Super Admin." });
            }

            request.Status = "Rejected";
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedByUserId = currentUserId;
            request.ReviewedByUserName = currentUserName;
            request.ReviewRemarks = string.IsNullOrWhiteSpace(dto?.Remarks) ? "Rejected by Branch Manager." : dto!.Remarks;

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "RejectPasswordReset",
                Branch = currentBranch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} rejected password reset request for {request.UserEmail}",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Password reset request rejected." });
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("super-admin/password-reset-requests")]
        public async Task<ActionResult<List<BranchPasswordResetRequestDto>>> GetSuperAdminPasswordResetRequestsAsync()
        {
            var requests = await _context.BranchPasswordResetRequests
                .OrderByDescending(request => request.RequestedAt)
                .Take(300)
                .Select(request => new BranchPasswordResetRequestDto
                {
                    RequestId = request.RequestId,
                    UserId = request.UserId,
                    Branch = request.Branch,
                    UserEmail = request.UserEmail,
                    UserName = request.UserEmail,
                    RequestedByFirstName = request.RequestedByFirstName,
                    RequestedByLastName = request.RequestedByLastName,
                    RequestedByEmail = request.RequestedByEmail,
                    RequestedByAddress = request.RequestedByAddress,
                    RequestedRoleName = request.RequestedRoleName,
                    Status = request.Status,
                    RequestedAt = request.RequestedAt.ToString("o"),
                    ReviewedAt = request.ReviewedAt.HasValue ? request.ReviewedAt.Value.ToString("o") : null,
                    ReviewedByUserName = request.ReviewedByUserName,
                    ReviewRemarks = request.ReviewRemarks
                })
                .ToListAsync();
            return Ok(requests);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("super-admin/password-reset-requests/{requestId}/confirm")]
        public async Task<IActionResult> ConfirmSuperAdminPasswordResetRequestAsync(
            [FromRoute] string requestId,
            [FromBody] ReviewPasswordResetRequestDto? dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var currentUserName = currentUser?.UserName ?? "SuperAdmin";

            var request = await _context.BranchPasswordResetRequests
                .FirstOrDefaultAsync(item =>
                    item.RequestId == requestId &&
                    string.Equals(item.RequestedRoleName, BranchManagerRole));
            if (request == null)
            {
                return NotFound(new { message = "Password reset request not found." });
            }
            if (!string.Equals(request.Status, "PendingSuperAdminApproval", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only pending Super Admin requests can be confirmed." });
            }

            var targetUser = await _userManager.FindByIdAsync(request.UserId);
            if (targetUser == null)
            {
                request.Status = "Rejected";
                request.ReviewedAt = DateTime.UtcNow;
                request.ReviewedByUserId = currentUserId;
                request.ReviewedByUserName = currentUserName;
                request.ReviewRemarks = "User account no longer exists.";
                await _context.SaveChangesAsync();
                return BadRequest(new { message = "Target user account no longer exists." });
            }

            var clientBaseUrl =
                _configuration["App:ClientBaseUrl"] ??
                _configuration["ClientBaseUrl"] ??
                "https://localhost:5173";
            var resetLink = $"{clientBaseUrl.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(targetUser.Email ?? request.UserEmail)}";

            var safeDisplayName = $"{targetUser.FirstName} {targetUser.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(safeDisplayName))
            {
                safeDisplayName = "User";
            }
            var emailBody = $@"
<div style='font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;'>
  <h2 style='margin-bottom: 8px;'>Password Reset Request Approved</h2>
  <p>Hello {safeDisplayName},</p>
  <p>Super Admin approved your password reset request. Use the secure link below to choose your account and set a new password.</p>
  <p>
    <a href='{resetLink}' style='display: inline-block; padding: 10px 16px; background: #001F3F; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700;'>
      Continue Password Reset
    </a>
  </p>
  <p>If you did not request this change, contact support immediately.</p>
</div>";

            bool emailSent;
            try
            {
                emailSent = await _emailSenderService.SendAsync(
                    targetUser.Email ?? request.UserEmail,
                    "KicksLogix Password Reset",
                    emailBody);
            }
            catch (InvalidOperationException emailEx)
            {
                return BadRequest(new
                {
                    message = "Unable to send reset email via Resend. Verify API key and sender configuration, then try again.",
                    providerError = emailEx.Message
                });
            }

            request.Status = "Approved";
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedByUserId = currentUserId;
            request.ReviewedByUserName = currentUserName;
            request.ReviewRemarks = string.IsNullOrWhiteSpace(dto?.Remarks)
                ? "Approved by Super Admin."
                : dto!.Remarks;
            request.ResetLinkSentAt = DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "ApprovePasswordReset",
                Branch = request.Branch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} approved password reset request for branch manager {targetUser.UserName}.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            if (!emailSent)
            {
                return Ok(new
                {
                    message = "Request approved, but Resend API key is not configured in Development. Email was not sent.",
                    resetLinkPreview = resetLink
                });
            }

            return Ok(new { message = "Request approved and reset link sent to branch manager email." });
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("super-admin/password-reset-requests/{requestId}/reject")]
        public async Task<IActionResult> RejectSuperAdminPasswordResetRequestAsync(
            [FromRoute] string requestId,
            [FromBody] ReviewPasswordResetRequestDto? dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var currentUserName = currentUser?.UserName ?? "SuperAdmin";

            var request = await _context.BranchPasswordResetRequests
                .FirstOrDefaultAsync(item =>
                    item.RequestId == requestId &&
                    string.Equals(item.RequestedRoleName, BranchManagerRole));
            if (request == null)
            {
                return NotFound(new { message = "Password reset request not found." });
            }
            if (!string.Equals(request.Status, "PendingSuperAdminApproval", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only pending Super Admin requests can be rejected." });
            }

            request.Status = "Rejected";
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedByUserId = currentUserId;
            request.ReviewedByUserName = currentUserName;
            request.ReviewRemarks = string.IsNullOrWhiteSpace(dto?.Remarks)
                ? "Rejected by Super Admin."
                : dto!.Remarks;

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = currentUserId,
                Action = "RejectPasswordReset",
                Branch = request.Branch,
                PerformedBy = currentUserName,
                Description = $"{currentUserName} rejected password reset request for branch manager {request.UserEmail}.",
                DatePerformed = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Password reset request rejected." });
        }

    }
}