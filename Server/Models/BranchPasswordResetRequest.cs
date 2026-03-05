using System.ComponentModel.DataAnnotations;
using Server.Utilities;

namespace Server.Models
{
    public class BranchPasswordResetRequest
    {
        [Key]
        [MaxLength(36)]
        public string RequestId { get; set; } = IdGenerator.Create("PRQ");

        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Branch { get; set; } = string.Empty;

        [MaxLength(100)]
        public string UserEmail { get; set; } = string.Empty;

        [MaxLength(50)]
        public string UserFirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string UserLastName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string RequestedByFirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string RequestedByLastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string RequestedByEmail { get; set; } = string.Empty;

        [MaxLength(120)]
        public string RequestedByAddress { get; set; } = string.Empty;

        [MaxLength(30)]
        public string RequestedRoleName { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Status { get; set; } = "PendingApproval";

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public DateTime? ResetLinkSentAt { get; set; }
        public DateTime? ResetCompletedAt { get; set; }

        [MaxLength(450)]
        public string? ReviewedByUserId { get; set; }

        [MaxLength(100)]
        public string? ReviewedByUserName { get; set; }

        [MaxLength(255)]
        public string? ReviewRemarks { get; set; }
    }
}
