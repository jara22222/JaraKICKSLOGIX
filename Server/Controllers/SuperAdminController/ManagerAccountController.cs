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
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using Server.Utilities;
namespace Server.Controllers

{   [Route("api/[controller]")]
    [ApiController]
    public class ManagerAccountController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<ManagerHub> _managerHubContext;
        private readonly IHubContext<SupplierHub> _legacySupplierHubContext;
        private readonly ApplicationDbContext _context;
        private readonly IEmailSenderService _emailSenderService;
        private readonly IConfiguration _configuration;

        public ManagerAccountController(
            UserManager<Users> user,
            RoleManager<IdentityRole> role,
            IHubContext<ManagerHub> managerHubContext,
            IHubContext<SupplierHub> legacySupplierHubContext,
            ApplicationDbContext context,
            IEmailSenderService emailSenderService,
            IConfiguration configuration)
        {
            _userManager = user;
            _roleManager = role;
            _managerHubContext = managerHubContext;
            _legacySupplierHubContext = legacySupplierHubContext;
            _context = context;
            _emailSenderService = emailSenderService;
            _configuration = configuration;
        }
    
        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("register-manager")]
        public async Task<IActionResult> PostAsync([FromBody] ManagerDto managerDto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";
                var ManagerUser = await BuildUniqueUserNameAsync(managerDto.LastName ?? "User");
                const string defaultPassword = "Manager@2026";
                var newManagerUser = new Users
                {
                    UserName = ManagerUser,
                    Email = managerDto.Email,
                    FirstName = managerDto.FirstName ?? "N/A",
                    MiddleName = managerDto.MiddleName ?? "",
                    LastName = managerDto.LastName ?? "N/A",
                    Branch = managerDto.Branch ?? "N/A",
                    Address = managerDto.Address ?? "N/A",
                    IsActive = "Active",
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(newManagerUser, defaultPassword);


                if(result.Succeeded)
                {
                    string roleName = "BranchManager";

                    if(!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole {Name = roleName});
                    }

                    await _userManager.AddToRoleAsync(newManagerUser,roleName);

                    var managerHubEvent = new ManagerHubEventDto
                    {
                        UserId = newManagerUser.Id,
                        UserName = ManagerUser,
                        Email = managerDto.Email ?? string.Empty,
                        Branch = managerDto.Branch ?? "N/A",
                        Status = "Active",
                        Message = "A new branch manager has joined!"
                    };
                    await _managerHubContext.SendToSuperAdminAsync("ManagerCreated", managerHubEvent);

                    // Keep legacy event for existing client listeners.
                    await _legacySupplierHubContext.SendToSuperAdminAsync("ReceiveNewBranchManager", managerHubEvent);

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
  <p>Your account has been created by Super Admin. For security, reset your password now before first use.</p>
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

                     
                    var currentUserName = User.Identity?.Name ?? "Admin";

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Create",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description =$"{currentUserName} created branch manager: {ManagerUser}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                // 3. Save it to the database
                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();



                    return Ok(new {
                        message= "Branch Manager account created and role assigned successfully!"
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
        
    }
}