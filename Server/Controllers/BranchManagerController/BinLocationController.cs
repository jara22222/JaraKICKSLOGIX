using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTO;
using Server.Hubs.BranchManagerHub;
using Server.Models;
using Server.Utilities;
using System.Security.Claims;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BinLocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BranchNotificationHub> _notificationHub;
        private static readonly IReadOnlyDictionary<string, int> FixedCapacityBySize =
            new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                ["S"] = 20,
                ["M"] = 40,
                ["L"] = 60,
                ["XL"] = 80,
                ["XXL"] = 100
            };

        public BinLocationController(
            ApplicationDbContext context,
            IHubContext<BranchNotificationHub> notificationHub)
        {
            _context = context;
            _notificationHub = notificationHub;
        }

        private static string BuildQrCodeString(string binId, string binLocation)
        {
            var normalizedLocation = (binLocation ?? string.Empty).Trim().ToUpperInvariant();
            // Non-URL payload so scanners treat this as bin data, not a web link.
            return $"BIN:{binId}|LOC:{normalizedLocation}";
        }

        [Authorize(Roles = "BranchManager,SuperAdmin,Receiver")]
        [HttpGet("get-bins")]
        public async Task<ActionResult<List<BinLocationListItemDto>>> GetAsync()
        {
            try
            {
                var bins = await _context.BinLocations
                    .Where(bin => bin.BinStatus != "Archived")
                    .OrderByDescending(bin => bin.CreatedAt)
                    .ToListAsync();

                var occupiedUnitsByBin = await GetOccupiedUnitsByBinAsync();
                var hasReconciled = false;
                foreach (var bin in bins)
                {
                    if (TryResolveFixedCapacity(bin.BinSize, out var fixedCapacity) && bin.BinCapacity != fixedCapacity)
                    {
                        bin.BinCapacity = fixedCapacity;
                        hasReconciled = true;
                    }
                    var computedOccupied = occupiedUnitsByBin.TryGetValue(bin.BinId, out var units)
                        ? Math.Min(units, Math.Max(bin.BinCapacity, 0))
                        : 0;
                    var computedAvailable = computedOccupied < bin.BinCapacity;
                    var computedStatus = computedOccupied > 0 ? "Occupied" : "Available";

                    if (bin.OccupiedQty == computedOccupied &&
                        bin.IsAvailable == computedAvailable &&
                        string.Equals(bin.BinStatus, computedStatus, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    bin.OccupiedQty = computedOccupied;
                    bin.IsAvailable = computedAvailable;
                    bin.BinStatus = computedStatus;
                    bin.UpdatedAt = DateTime.UtcNow;
                    hasReconciled = true;
                }

                if (hasReconciled)
                {
                    await _context.SaveChangesAsync();
                }

                return Ok(bins.Select(bin => new BinLocationListItemDto
                {
                    BinId = bin.BinId,
                    Branch = bin.Branch,
                    BinLocation = bin.BinLocationCode,
                    BinStatus = bin.BinStatus,
                    BinSize = bin.BinSize,
                    BinCapacity = bin.BinCapacity,
                    OccupiedQty = bin.OccupiedQty,
                    QrCodeString = BuildQrCodeString(bin.BinId, bin.BinLocationCode),
                    CreatedAt = bin.CreatedAt,
                    UpdatedAt = bin.UpdatedAt
                }).ToList());
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
                        Branch = bin.Branch,
                        BinLocation = bin.BinLocationCode,
                        BinStatus = bin.BinStatus,
                        BinSize = bin.BinSize,
                        BinCapacity = bin.BinCapacity,
                        OccupiedQty = bin.OccupiedQty,
                        QrCodeString = BuildQrCodeString(bin.BinId, bin.BinLocationCode),
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

        [Authorize(Roles = "DispatchClerk,PutAway")]
        [HttpGet("public-bin/{id}")]
        public async Task<ActionResult<BinLocationListItemDto>> GetPublicByIdAsync(string id)
        {
            try
            {
                var bin = await _context.BinLocations
                    .Where(item => item.BinId == id)
                    .FirstOrDefaultAsync();

                if (bin == null)
                {
                    return NotFound(new ApiMessageDto { Message = "Bin location not found." });
                }

                var occupiedUnitsByBin = await GetOccupiedUnitsByBinAsync();
                if (TryResolveFixedCapacity(bin.BinSize, out var fixedCapacity) && bin.BinCapacity != fixedCapacity)
                {
                    bin.BinCapacity = fixedCapacity;
                }
                var computedOccupied = occupiedUnitsByBin.TryGetValue(bin.BinId, out var units)
                    ? Math.Min(units, Math.Max(bin.BinCapacity, 0))
                    : 0;
                var computedAvailable = computedOccupied < bin.BinCapacity;
                var computedStatus = computedOccupied > 0 ? "Occupied" : "Available";
                if (bin.OccupiedQty != computedOccupied ||
                    bin.IsAvailable != computedAvailable ||
                    !string.Equals(bin.BinStatus, computedStatus, StringComparison.OrdinalIgnoreCase))
                {
                    bin.OccupiedQty = computedOccupied;
                    bin.IsAvailable = computedAvailable;
                    bin.BinStatus = computedStatus;
                    bin.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return Ok(new BinLocationListItemDto
                {
                    BinId = bin.BinId,
                    Branch = bin.Branch,
                    BinLocation = bin.BinLocationCode,
                    BinStatus = bin.BinStatus,
                    BinSize = bin.BinSize,
                    BinCapacity = bin.BinCapacity,
                    OccupiedQty = bin.OccupiedQty,
                    QrCodeString = BuildQrCodeString(bin.BinId, bin.BinLocationCode),
                    CreatedAt = bin.CreatedAt,
                    UpdatedAt = bin.UpdatedAt
                });
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

                if (string.IsNullOrWhiteSpace(sanitizedSize))
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin size is required." });
                }

                if (!TryResolveFixedCapacity(sanitizedSize, out var fixedCapacity))
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin size is invalid." });
                }

                var duplicate = await _context.BinLocations.AnyAsync(bin =>
                    bin.BinLocationCode == sanitizedLocation &&
                    bin.Branch == branchName);
                if (duplicate)
                {
                    return Conflict(new ApiMessageDto { Message = "Bin location already exists for this branch." });
                }

                var bin = new BinLocation
                {
                    BinId = IdGenerator.Create("BIN"),
                    BinLocationCode = sanitizedLocation,
                    Branch = branchName,
                    BinStatus = "Available",
                    IsAvailable = true,
                    BinSize = sanitizedSize,
                    BinCapacity = fixedCapacity,
                    OccupiedQty = 0,
                    QrCodeString = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                bin.QrCodeString = BuildQrCodeString(bin.BinId, bin.BinLocationCode);

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
                await _notificationHub.SendToBranchAndSuperAdminAsync(branchName, "BinLocationUpdated", new
                {
                    binId = bin.BinId,
                    status = bin.BinStatus,
                    branch = branchName,
                    updatedAt = DateTime.UtcNow
                });

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

                if (string.IsNullOrWhiteSpace(sanitizedSize))
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin size is required." });
                }

                if (!TryResolveFixedCapacity(sanitizedSize, out var fixedCapacity))
                {
                    return BadRequest(new ApiMessageDto { Message = "Bin size is invalid." });
                }

                if (bin.OccupiedQty > fixedCapacity)
                {
                    return BadRequest(new ApiMessageDto
                    {
                        Message = $"Cannot change size to {sanitizedSize}: current occupied units ({bin.OccupiedQty}) exceed fixed capacity ({fixedCapacity})."
                    });
                }

                bin.BinLocationCode = sanitizedLocation;
                bin.BinSize = sanitizedSize;
                bin.BinCapacity = fixedCapacity;
                if (User.IsInRole("SuperAdmin") && !string.IsNullOrWhiteSpace(dto.Branch))
                {
                    bin.Branch = dto.Branch.Trim();
                }
                bin.BinStatus = string.IsNullOrWhiteSpace(dto.BinStatus) ? "Available" : dto.BinStatus;
                bin.IsAvailable = bin.BinStatus == "Available";
                bin.QrCodeString = BuildQrCodeString(bin.BinId, bin.BinLocationCode);
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
                await _notificationHub.SendToBranchAndSuperAdminAsync(bin.Branch, "BinLocationUpdated", new
                {
                    binId = bin.BinId,
                    status = bin.BinStatus,
                    branch = bin.Branch,
                    updatedAt = DateTime.UtcNow
                });
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

                var activeInventoryCount = await _context.Inventory.CountAsync(item =>
                    item.BinId == id &&
                    item.IsBinAssigned &&
                    item.WorkflowStatus != "Archived");
                var hasActiveInventory = activeInventoryCount > 0;
                var isBinActive = bin.BinStatus != "Archived";
                if ((isBinActive && bin.OccupiedQty > 0) || hasActiveInventory)
                {
                    return Conflict(new ApiMessageDto
                    {
                        Message = $"Cannot archive bin {bin.BinLocationCode}: occupied slots {bin.OccupiedQty}/{bin.BinCapacity}, active assigned products {activeInventoryCount}. Clear assignments first."
                    });
                }

                var location = bin.BinLocationCode;
                bin.BinStatus = "Archived";
                bin.IsAvailable = false;
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
                await _notificationHub.SendToBranchAndSuperAdminAsync(bin.Branch, "BinLocationUpdated", new
                {
                    binId = bin.BinId,
                    status = bin.BinStatus,
                    branch = bin.Branch,
                    updatedAt = DateTime.UtcNow
                });
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
                bin.IsAvailable = true;
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
                await _notificationHub.SendToBranchAndSuperAdminAsync(bin.Branch, "BinLocationUpdated", new
                {
                    binId = bin.BinId,
                    status = bin.BinStatus,
                    branch = bin.Branch,
                    updatedAt = DateTime.UtcNow
                });
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

        [Authorize(Roles = "BranchManager,SuperAdmin")]
        [HttpPost("normalize-bin-qr")]
        public async Task<ActionResult<ApiMessageDto>> NormalizeBinQrAsync()
        {
            try
            {
                var bins = await _context.BinLocations.ToListAsync();
                if (bins.Count == 0)
                {
                    return Ok(new ApiMessageDto { Message = "No bins found to normalize." });
                }

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserName = User.Identity?.Name ?? "Admin";
                var currentUser = await _context.Users.FirstOrDefaultAsync(user => user.Id == currentUserId);
                var branchName = currentUser?.Branch ?? "N/A";

                var updatedCount = 0;
                foreach (var bin in bins)
                {
                    var expectedQr = BuildQrCodeString(bin.BinId, bin.BinLocationCode);
                    if (string.Equals(bin.QrCodeString, expectedQr, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    bin.QrCodeString = expectedQr;
                    bin.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;
                }

                if (updatedCount > 0)
                {
                    _context.AuditLogs.Add(new AuditLog
                    {
                        UserId = currentUserId ?? "N/A",
                        Action = "NormalizeBinQr",
                        Branch = branchName,
                        PerformedBy = currentUserName,
                        Description = $"{currentUserName} normalized QR payloads for {updatedCount} bin location(s).",
                        DatePerformed = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                if (updatedCount > 0)
                {
                    var affectedBranches = bins
                        .Select(bin => bin.Branch)
                        .Where(branch => !string.IsNullOrWhiteSpace(branch))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();

                    foreach (var affectedBranch in affectedBranches)
                    {
                        await _notificationHub.SendToBranchAndSuperAdminAsync(affectedBranch, "BinLocationUpdated", new
                        {
                            branch = affectedBranch,
                            action = "NormalizeBinQr",
                            updatedCount,
                            updatedAt = DateTime.UtcNow
                        });
                    }
                }
                return Ok(new ApiMessageDto
                {
                    Message = updatedCount == 0
                        ? "Bin QR payloads are already normalized."
                        : $"Normalized QR payloads for {updatedCount} bin(s)."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiMessageDto
                {
                    Message = $"An internal server error occurred. {ex.Message}",
                });
            }
        }

        private async Task<Dictionary<string, int>> GetOccupiedUnitsByBinAsync()
        {
            var inventoryAssignments = await _context.Inventory
                .Where(item =>
                    item.IsBinAssigned &&
                    !string.IsNullOrWhiteSpace(item.BinId) &&
                    item.WorkflowStatus != "Archived" &&
                    item.QuantityOnHand > 0)
                .Select(item => new
                {
                    BinId = item.BinId!,
                    item.QuantityOnHand
                })
                .ToListAsync();

            return inventoryAssignments
                .GroupBy(item => item.BinId)
                .ToDictionary(
                    group => group.Key,
                    group => group.Sum(item => Math.Max(item.QuantityOnHand, 0)));
        }

        private static bool TryResolveFixedCapacity(string size, out int capacity)
        {
            var normalized = (size ?? string.Empty).Trim().ToUpperInvariant();
            return FixedCapacityBySize.TryGetValue(normalized, out capacity);
        }
    }
}
