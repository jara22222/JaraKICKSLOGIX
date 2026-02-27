using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class StockMovement
    {
        [Key]
        [MaxLength(36)]
        public string MovementId { get; set; } = Guid.NewGuid().ToString();

        [MaxLength(36)]
        public string? ProductId { get; set; }

        [MaxLength(36)]
        public string? OrderId { get; set; }

        [MaxLength(128)]
        public string? BinId { get; set; }

        [MaxLength(50)]
        public string Branch { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(30)]
        public string? FromStatus { get; set; }

        [MaxLength(30)]
        public string? ToStatus { get; set; }

        public int Quantity { get; set; }

        [MaxLength(450)]
        public string PerformedByUserId { get; set; } = string.Empty;

        [MaxLength(80)]
        public string PerformedBy { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Description { get; set; } = string.Empty;

        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    }
}
