using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Utilities;

namespace Server.Models
{
    public class AuditLog
    {
        [Key]
        [MaxLength(36)]
        public string LogId { get; set; } = IdGenerator.Create("LOG"); 
        [MaxLength(128)]
        public string UserId { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [MaxLength(50)]
        public string? Branch { get; set; } = string.Empty;
        public DateTime DatePerformed { get; set; } = DateTime.UtcNow;
    }
}