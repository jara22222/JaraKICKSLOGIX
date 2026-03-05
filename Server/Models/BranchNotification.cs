using System.ComponentModel.DataAnnotations;
using Server.Utilities;

namespace Server.Models
{
    public class BranchNotification
    {
        [Key]
        [MaxLength(36)]
        public string NotificationId { get; set; } = IdGenerator.Create("NTF");

        [MaxLength(50)]
        public string Branch { get; set; } = string.Empty;

        [MaxLength(450)]
        public string RecipientUserId { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Type { get; set; } = "LowStock";

        [MaxLength(3)]
        public string? Size { get; set; }

        [MaxLength(255)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
    }
}
