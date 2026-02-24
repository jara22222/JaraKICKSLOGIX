using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BinLocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BinLocationController(ApplicationDbContext context)
        {
            _context = context;
        }

        private static string BuildQrCodeString(string binId)
        {
            return $"http://localhost:5173/binlocation/product/{binId}";
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpGet("get-bins")]
        public async Task<ActionResult<List<BinLocationListItemDto>>> GetAsync()
        {
            try
            {
                var bins = await _context.BinLocations
                    .Where(bin => bin.BinStatus != "Archived")
                    .OrderByDescending(bin => bin.CreatedAt)
                    .Select(bin => new BinLocationListItemDto
                    {
                        BinId = bin.BinId,
                        BinLocation = bin.BinLocationCode,
                        BinStatus = bin.BinStatus,
                        BinSize = bin.BinSize,
                        BinCapacity = bin.BinCapacity,
                        QrCodeString = bin.QrCodeString,
                        CreatedAt = bin.CreatedAt,
                        UpdatedAt = bin.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(bins);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpGet("get-archived-bins")]
        public async Task<ActionResult<List<BinLocationListItemDto>>> GetArchivedAsync()
        {
            try
            {
                var bins = await _context.BinLocations
                    .Where(bin => bin.BinStatus == "Archived")
                    .OrderByDescending(bin => bin.UpdatedAt)
                    .Select(bin => new BinLocationListItemDto
                    {
                        BinId = bin.BinId,
                        BinLocation = bin.BinLocationCode,
                        BinStatus = bin.BinStatus,
                        BinSize = bin.BinSize,
                        BinCapacity = bin.BinCapacity,
                        QrCodeString = bin.QrCodeString,
                        CreatedAt = bin.CreatedAt,
                        UpdatedAt = bin.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(bins);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "OutboundCoordinator")]
        [HttpGet("public-bin/{id}")]
        public async Task<ActionResult<BinLocationListItemDto>> GetPublicByIdAsync(string id)
        {
            try
            {
                var bin = await _context.BinLocations
                    .Where(item => item.BinId == id)
                    .Select(item => new BinLocationListItemDto
                    {
                        BinId = item.BinId,
                        BinLocation = item.BinLocationCode,
                        BinStatus = item.BinStatus,
                        BinSize = item.BinSize,
                        BinCapacity = item.BinCapacity,
                        QrCodeString = item.QrCodeString,
                        CreatedAt = item.CreatedAt,
                        UpdatedAt = item.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                if (bin == null)
                {
                    return NotFound(new ApiMessageDto { Message = "Bin location not found." });
                }

                return Ok(bin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "BranchManager")]
        [HttpPost("create-bin")]
        public async Task<ActionResult<ApiMessageDto>> CreateAsync([FromBody] BinLocationCreateDto dto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "BranchManager";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";

                var sanitizedLocation = dto.BinLocation?.Trim().ToUpperInvariant() ?? string.Empty;
                var sanitizedSize = dto.BinSize?.Trim().ToUpperInvariant() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(sanitizedLocation))
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin location is required." });
                }

                if (dto.BinCapacity <= 0)
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin capacity must be greater than zero." });
                }

                var duplicate = await _context.BinLocations.AnyAsync(bin => bin.BinLocationCode == sanitizedLocation);
                if (duplicate)
                {
                    return Conflict(new ApiMessageDto { Message = "Bin location already exists." });
                }

                var bin = new BinLocation
                {
                    BinId = Guid.NewGuid().ToString(),
                    BinLocationCode = sanitizedLocation,
                    BinStatus = "Available",
                    BinSize = sanitizedSize,
                    BinCapacity = dto.BinCapacity,
                    QrCodeString = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                bin.QrCodeString = BuildQrCodeString(bin.BinId);

                _context.BinLocations.Add(bin);
                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Create",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description = $"{currentUserName} created bin location: {sanitizedLocation}",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                return Ok(new ApiMessageDto { Message = "Bin location created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpPut("update-bin/{id}")]
        public async Task<ActionResult<ApiMessageDto>> UpdateAsync(string id, [FromBody] BinLocationUpdateDto dto)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "Admin";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";

                var bin = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinId == id);
                if (bin == null)
                {
                    return NotFound(new ApiMessageDto { Message = "Bin location not found." });
                }

                var sanitizedLocation = dto.BinLocation?.Trim().ToUpperInvariant() ?? string.Empty;
                var sanitizedSize = dto.BinSize?.Trim().ToUpperInvariant() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(sanitizedLocation))
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin location is required." });
                }

                if (dto.BinCapacity <= 0)
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin capacity must be greater than zero." });
                }

                bin.BinLocationCode = sanitizedLocation;
                bin.BinSize = sanitizedSize;
                bin.BinCapacity = dto.BinCapacity;
                bin.BinStatus = string.IsNullOrWhiteSpace(dto.BinStatus) ? "Available" : dto.BinStatus;
                bin.QrCodeString = BuildQrCodeString(bin.BinId);
                bin.UpdatedAt = DateTime.UtcNow;

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Update",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description = $"{currentUserName} updated bin location: {sanitizedLocation}",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return Ok(new ApiMessageDto { Message = "Bin location updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpDelete("archive-bin/{id}")]
        public async Task<ActionResult<ApiMessageDto>> ArchiveAsync(string id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "Admin";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";

                var bin = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinId == id);
                if (bin == null)
                {
                    return NotFound(new ApiMessageDto { Message = "Bin location not found." });
                }

                var location = bin.BinLocationCode;
                bin.BinStatus = "Archived";
                bin.UpdatedAt = DateTime.UtcNow;
                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Archive",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description = $"{currentUserName} archived bin location: {location}",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return Ok(new ApiMessageDto { Message = "Bin location archived successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpPut("restore-bin/{id}")]
        public async Task<ActionResult<ApiMessageDto>> RestoreAsync(string id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "Admin";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";

                var bin = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinId == id);
                if (bin == null)
                {
                    return NotFound(new ApiMessageDto { Message = "Bin location not found." });
                }

                bin.BinStatus = "Available";
                bin.UpdatedAt = DateTime.UtcNow;

                _context.AuditLogs.Add(new AuditLog
                {
                    UserId = currentUserId ?? "N/A",
                    Action = "Restore",
                    Branch = branchName,
                    PerformedBy = currentUserName,
                    Description = $"{currentUserName} restored bin location: {bin.BinLocationCode}",
                    DatePerformed = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                return Ok(new ApiMessageDto { Message = "Bin location restored successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }
    }
}
