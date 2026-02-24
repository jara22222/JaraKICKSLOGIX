using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Hubs;
using Server.DTO;
using Server.Models;
using Server.Services;
using Server.Data;  
using System.Security.Claims;
namespace Server.Controllers

{   [Route("api/[controller]")]
    [ApiController]
    public class SupplierController:ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHubContext<SupplierHub> _hubContext;    
        private readonly ApplicationDbContext _context;

        public SupplierController(
            UserManager<Users> user,
            RoleManager<IdentityRole> role,
            IHubContext<SupplierHub> hubContext,
            ApplicationDbContext context)
        {
            _userManager = user;
            _roleManager = role;
            _hubContext = hubContext;
            _context = context;
        }
    
        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("register-supplier")]
        public async Task<ActionResult<ApiMessageDto>> PostAsync([FromBody] SupplierDto supplierDto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";

                var newSupplierUser = new Users
                {
                    UserName = supplierDto.CompanyName,
                    Email = supplierDto.Email,
                    FirstName = supplierDto.ContactPerson,
                    LastName = "Supplier",
                    Address =  supplierDto.CompanyAddress,
                    IsActive = supplierDto.Agreement ? "Active" : "Pending",
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(newSupplierUser, "Supplier@2026");


                if(result.Succeeded)
                {
                    string roleName = "Supplier";

                    if(!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole {Name = roleName});
                    }
                    await _userManager.AddToRoleAsync(newSupplierUser,roleName);

                    var supplierHubEvent = new SupplierHubEventDto
                    {
                        UserId = newSupplierUser.Id,
                        CompanyName = supplierDto.CompanyName,
                        Email = supplierDto.Email,
                        Status = newSupplierUser.IsActive,
                        Message = "A new supplier has joined!"
                    };
                    await _hubContext.Clients.All.SendAsync("ReceiveNewSupplier", supplierHubEvent);
                    await _hubContext.Clients.All.SendAsync("SupplierCreated", supplierHubEvent);

                
                var currentUserName = User.Identity?.Name ?? "Admin";

                // 2. Create the clean, human-readable log
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Create",
                    PerformedBy = currentUserName,
                    Branch=branchName,
                    Description =$"{currentUserName} created supplier: {supplierDto.CompanyName}", // e.g., "Created supplier: Supplier1"
                    DatePerformed = DateTime.UtcNow
                };

                // 3. Save it to the database
                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();



                    return Ok(new ApiMessageDto
                    {
                        Message = "Supplier account created and role assigned successfully!"
                    });
                }
                return BadRequest(result.Errors);
            }
            catch (System.Exception ex)
            {
                 // TODO
                 return StatusCode(500, new ApiMessageDto {
                    Message = $"An internal server error occurred. {ex.Message}",
                 });
            }
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("get-suppliers")]
        public async Task<ActionResult<List<SupplierListItemDto>>> GetSuppliersAsync()
        {
            try
            {
                var suppliers = await (
                    from user in _userManager.Users
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId
                    join role in _roleManager.Roles on userRole.RoleId equals role.Id
                    where role.Name == "Supplier"
                    select new SupplierListItemDto
                    {
                        Id = user.Id,
                        CompanyName = user.UserName,
                        CompanyAddress = user.Address,
                        ContactPerson = user.FirstName,
                        Email = user.Email ?? string.Empty,
                        Status = string.IsNullOrWhiteSpace(user.IsActive) ? "Pending" : user.IsActive,
                        Agreement = user.IsActive == "Active",
                        CreatedAt = user.CreatedAt
                    }
                ).ToListAsync();

                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("update-supplier/{id}")]
        public async Task<ActionResult<ApiMessageDto>> UpdateSupplierAsync([FromRoute] string id, [FromBody] SupplierDto supplierDto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";

                var supplierUser = await _userManager.FindByIdAsync(id);
                if (supplierUser == null) return NotFound(new ApiMessageDto { Message = "Supplier not found." });
                var previousSupplierName = supplierUser.UserName ?? "Unknown Supplier";

                supplierUser.UserName = supplierDto.CompanyName;
                supplierUser.Email = supplierDto.Email;
                supplierUser.FirstName = supplierDto.ContactPerson;
                supplierUser.LastName = "Supplier";
                supplierUser.Address = supplierDto.CompanyAddress;
                supplierUser.IsActive = supplierDto.Agreement ? "Active" : "Pending";
                supplierUser.UpdatedAt = DateTime.UtcNow;
                supplierUser.EmailConfirmed = true;

                var result = await _userManager.UpdateAsync(supplierUser);
                if (!result.Succeeded) return BadRequest(result.Errors);

                var currentUserName = User.Identity?.Name ?? "Admin";
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Update",
                    PerformedBy = currentUserName,
                    Branch = branchName,
                    Description = $"{currentUserName} updated supplier: {previousSupplierName} to {supplierDto.CompanyName}",
                    DatePerformed = DateTime.UtcNow
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                var updatedSupplierEvent = new SupplierHubEventDto
                {
                    UserId = supplierUser.Id,
                    CompanyName = supplierUser.UserName ?? supplierDto.CompanyName,
                    Email = supplierUser.Email ?? string.Empty,
                    Status = supplierUser.IsActive ?? "Pending",
                    Message = "Supplier profile updated."
                };
                await _hubContext.Clients.All.SendAsync("SupplierUpdated", updatedSupplierEvent);

                return Ok(new ApiMessageDto { Message = "Supplier updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPut("archive-supplier/{id}")]
        public async Task<ActionResult<ApiMessageDto>> ArchiveSupplierAsync([FromRoute] string id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUser = await _userManager.FindByIdAsync(currentUserId ?? "");
                var branchName = currentUser?.Branch ?? "N/A";

                var supplierUser = await _userManager.FindByIdAsync(id);
                if (supplierUser == null) return NotFound(new ApiMessageDto { Message = "Supplier not found." });
                var supplierName = supplierUser.UserName ?? "Unknown Supplier";

                supplierUser.IsActive = "Archived";
                supplierUser.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(supplierUser);
                if (!result.Succeeded) return BadRequest(result.Errors);

                var currentUserName = User.Identity?.Name ?? "Admin";
                var auditLog = new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Archive",
                    PerformedBy = currentUserName,
                    Branch = branchName,
                    Description = $"{currentUserName} archived supplier: {supplierName}",
                    DatePerformed = DateTime.UtcNow
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                var archivedSupplierEvent = new SupplierHubEventDto
                {
                    UserId = supplierUser.Id,
                    CompanyName = supplierName,
                    Email = supplierUser.Email ?? string.Empty,
                    Status = "Archived",
                    Message = "Supplier archived."
                };
                await _hubContext.Clients.All.SendAsync("SupplierArchived", archivedSupplierEvent);

                return Ok(new ApiMessageDto { Message = "Supplier archived successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

    }
}