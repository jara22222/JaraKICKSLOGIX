using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Server.DTOs;
using Server.DTO.AuthDto;
using Server.Data;
using Server.Models;
using Server.Services;
using Server.Hubs.BranchManagerHub;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly TokenService _tokenService;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchAccountHub> _branchAccountHubContext;
        private const string BranchManagerRole = "BranchManager";
        private const string BranchDefaultPassword = "KicksLogix@2026";
        private const string ManagerDefaultPassword = "Manager@2026";
        private static readonly HashSet<string> AllowedBranchRoles =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "Receiver",
                "PutAway",
                "VASPersonnel",
                "DispatchClerk"
            };
        private static readonly HashSet<string> AllowedForgotPasswordRoles =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "Receiver",
                "PutAway",
                "VASPersonnel",
                "DispatchClerk",
                BranchManagerRole
            };

        public AuthController(
            UserManager<Users> userManager,
            TokenService tokenService,
            ApplicationDbContext context,
            IHubContext<BranchAccountHub> branchAccountHubContext)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _context = context;
            _branchAccountHubContext = branchAccountHubContext;
        }
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var normalizedIdentity = loginDto.Username.Trim();
            if (normalizedIdentity.Contains('@'))
            {
                return BadRequest(new
                {
                    message = "Email login is disabled. Please use your username."
                });
            }

            // 1. Username-only login.
            var user = await _userManager.FindByNameAsync(normalizedIdentity);

            if (user == null)
                return Unauthorized(new { message = "Invalid username or password" });

            // 2. Check password
            var isValidPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!isValidPassword)
                return Unauthorized(new { message = "Invalid username or password" });

            // 3. Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            // 4. Generate JWT token
            var token = _tokenService.CreateToken(user, roles);

            // 5. Return token + user info
            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    userName = user.UserName,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    branch = user.Branch,
                    roles
                }
            });
        }

        [AllowAnonymous]
        [HttpPost("forgot-password/branch-request")]
        public async Task<IActionResult> SubmitBranchForgotPasswordRequestAsync([FromBody] BranchForgotPasswordRequestDto dto)
        {
            var normalizedEmail = (dto.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(normalizedEmail))
            {
                return Ok(new
                {
                    message = "If your account is eligible, your request has been submitted for admin verification."
                });
            }

            var normalizedEmailForIdentity = _userManager.NormalizeEmail(normalizedEmail);
            var emailCandidates = await _userManager.Users
                .Where(candidate => candidate.NormalizedEmail == normalizedEmailForIdentity)
                .ToListAsync();

            var createdRequestCount = 0;
            var requestCreatedAt = DateTime.UtcNow;
            foreach (var candidate in emailCandidates)
            {
                var roles = await _userManager.GetRolesAsync(candidate);
                var roleName = roles.FirstOrDefault(role => AllowedForgotPasswordRoles.Contains(role));
                var isEligibleRole = !string.IsNullOrWhiteSpace(roleName);
                var isUserActive =
                    !string.Equals(candidate.IsActive, "Archived", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(candidate.IsActive, "Inactive", StringComparison.OrdinalIgnoreCase);

                if (!isEligibleRole || !isUserActive)
                {
                    continue;
                }

                var requiresSuperAdminReview = string.Equals(
                    roleName,
                    BranchManagerRole,
                    StringComparison.OrdinalIgnoreCase);
                var pendingStatus = requiresSuperAdminReview ? "PendingSuperAdminApproval" : "PendingApproval";
                var hasPendingRequest = await _context.BranchPasswordResetRequests.AnyAsync(request =>
                    request.UserId == candidate.Id &&
                    (request.Status == "PendingApproval" || request.Status == "PendingSuperAdminApproval"));
                if (hasPendingRequest)
                {
                    continue;
                }

                _context.BranchPasswordResetRequests.Add(new BranchPasswordResetRequest
                {
                    UserId = candidate.Id,
                    Branch = string.IsNullOrWhiteSpace(candidate.Branch) ? "N/A" : candidate.Branch,
                    UserEmail = candidate.Email ?? normalizedEmail,
                    UserFirstName = candidate.FirstName ?? string.Empty,
                    UserLastName = candidate.LastName ?? string.Empty,
                    RequestedByFirstName = string.Empty,
                    RequestedByLastName = string.Empty,
                    RequestedByEmail = normalizedEmail,
                    RequestedByAddress = string.Empty,
                    RequestedRoleName = roleName!,
                    Status = pendingStatus,
                    RequestedAt = requestCreatedAt
                });

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = candidate.Id,
                    Action = "RequestPasswordReset",
                    Branch = string.IsNullOrWhiteSpace(candidate.Branch) ? "N/A" : candidate.Branch,
                    PerformedBy = candidate.UserName ?? candidate.Email ?? normalizedEmail,
                    Description = requiresSuperAdminReview
                        ? $"{candidate.UserName ?? candidate.Email} submitted a password reset request for Super Admin verification."
                        : $"{candidate.UserName ?? candidate.Email} submitted a password reset request for branch verification."
                });

                await _branchAccountHubContext.Clients.All.SendAsync("PasswordResetRequested", new
                {
                    branch = string.IsNullOrWhiteSpace(candidate.Branch) ? "N/A" : candidate.Branch,
                    userEmail = candidate.Email ?? normalizedEmail,
                    userName = candidate.UserName ?? string.Empty,
                    requestedRoleName = roleName,
                    approvalTargetRole = requiresSuperAdminReview ? "SuperAdmin" : "BranchManager",
                    requestedAt = requestCreatedAt
                });

                createdRequestCount += 1;
            }

            if (createdRequestCount == 0)
            {
                var unresolvedUserId = $"UNRESOLVED:{normalizedEmail}";
                var hasPendingUnresolvedRequest = await _context.BranchPasswordResetRequests.AnyAsync(request =>
                    request.UserId == unresolvedUserId &&
                    (request.Status == "PendingApproval" || request.Status == "PendingSuperAdminApproval"));

                if (!hasPendingUnresolvedRequest)
                {
                    _context.BranchPasswordResetRequests.Add(new BranchPasswordResetRequest
                    {
                        UserId = unresolvedUserId,
                        Branch = "N/A",
                        UserEmail = normalizedEmail,
                        UserFirstName = string.Empty,
                        UserLastName = string.Empty,
                        RequestedByFirstName = string.Empty,
                        RequestedByLastName = string.Empty,
                        RequestedByEmail = normalizedEmail,
                        RequestedByAddress = string.Empty,
                        RequestedRoleName = "Unresolved",
                        Status = "PendingSuperAdminApproval",
                        RequestedAt = requestCreatedAt
                    });

                    _context.AuditLogs.Add(new AuditLog
                    {
                        UserId = unresolvedUserId,
                        Action = "RequestPasswordReset",
                        Branch = "N/A",
                        PerformedBy = normalizedEmail,
                        Description = $"{normalizedEmail} submitted a password reset request but no eligible account was matched."
                    });

                    await _branchAccountHubContext.Clients.All.SendAsync("PasswordResetRequested", new
                    {
                        branch = "N/A",
                        userEmail = normalizedEmail,
                        userName = normalizedEmail,
                        requestedRoleName = "Unresolved",
                        approvalTargetRole = "SuperAdmin",
                        requestedAt = requestCreatedAt
                    });
                }
            }

            if (createdRequestCount > 0 || !string.IsNullOrWhiteSpace(normalizedEmail))
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "If your account is eligible, your request has been submitted for admin verification."
            });
        }

        [AllowAnonymous]
        [HttpGet("reset-password/options")]
        public async Task<IActionResult> GetResetPasswordOptionsAsync([FromQuery] string email)
        {
            var normalizedEmail = (email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalizedEmail))
            {
                return Ok(new { accounts = Array.Empty<object>() });
            }

            var normalizedEmailForIdentity = _userManager.NormalizeEmail(normalizedEmail);
            var candidates = await _userManager.Users
                .Where(candidate => candidate.NormalizedEmail == normalizedEmailForIdentity)
                .ToListAsync();

            if (candidates.Count == 0)
            {
                return Ok(new { accounts = Array.Empty<object>() });
            }

            var hasApprovedRequestForEmail = await _context.BranchPasswordResetRequests.AnyAsync(request =>
                request.Status == "Approved" &&
                (request.UserEmail == normalizedEmail || request.RequestedByEmail == normalizedEmail));
            if (!hasApprovedRequestForEmail)
            {
                return Ok(new { accounts = Array.Empty<object>() });
            }

            var accounts = new List<object>();
            foreach (var candidate in candidates)
            {
                var roles = await _userManager.GetRolesAsync(candidate);
                var matchedRole = roles.FirstOrDefault();
                var isUserActive =
                    !string.Equals(candidate.IsActive, "Archived", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(candidate.IsActive, "Inactive", StringComparison.OrdinalIgnoreCase);
                if (!isUserActive)
                {
                    continue;
                }

                accounts.Add(new
                {
                    userId = candidate.Id,
                    userName = candidate.UserName ?? string.Empty,
                    firstName = candidate.FirstName ?? string.Empty,
                    lastName = candidate.LastName ?? string.Empty,
                    roleName = string.IsNullOrWhiteSpace(matchedRole) ? "UnknownRole" : matchedRole,
                    branch = candidate.Branch ?? string.Empty
                });
            }

            return Ok(new { accounts });
        }

        [AllowAnonymous]
        [HttpPost("reset-password/resolve-account")]
        public async Task<IActionResult> ResolveResetPasswordAccountAsync([FromBody] ResolveResetAccountDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedEmail = (dto.Email ?? string.Empty).Trim().ToLowerInvariant();
            var normalizedEmailForIdentity = _userManager.NormalizeEmail(normalizedEmail);
            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null || !string.Equals(user.NormalizedEmail, normalizedEmailForIdentity, StringComparison.Ordinal))
            {
                return BadRequest(new { message = "Invalid reset account selection." });
            }

            var hasApprovedRequestForEmail = await _context.BranchPasswordResetRequests.AnyAsync(request =>
                request.Status == "Approved" &&
                (request.UserEmail == normalizedEmail || request.RequestedByEmail == normalizedEmail));
            if (!hasApprovedRequestForEmail)
            {
                return BadRequest(new { message = "This account is not approved for password reset." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            return Ok(new
            {
                userId = user.Id,
                token = encodedToken
            });
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPasswordAsync([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!string.Equals(dto.NewPassword, dto.ConfirmPassword, StringComparison.Ordinal))
            {
                return BadRequest(new { message = "New password and confirmation password do not match." });
            }

            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid reset request." });
            }

            string decodedToken;
            try
            {
                var tokenBytes = WebEncoders.Base64UrlDecode(dto.Token);
                decodedToken = Encoding.UTF8.GetString(tokenBytes);
            }
            catch
            {
                return BadRequest(new { message = "Invalid or expired reset link." });
            }

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            var latestApprovedRequest = await _context.BranchPasswordResetRequests
                .Where(request => request.UserId == user.Id && request.Status == "Approved")
                .OrderByDescending(request => request.ReviewedAt ?? request.RequestedAt)
                .FirstOrDefaultAsync();

            if (latestApprovedRequest != null)
            {
                latestApprovedRequest.Status = "Completed";
                latestApprovedRequest.ResetCompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Your password has been reset successfully." });
        }

    }
}