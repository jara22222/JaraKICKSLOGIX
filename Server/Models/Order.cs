using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class Order
    {
        [Key]
        [MaxLength(36)]
        public string OrderId { get; set; } = Guid.NewGuid().ToString();

        [MaxLength(50)]
        public string Branch { get; set; } = string.Empty;

        [MaxLength(80)]
        public string CustomerName { get; set; } = string.Empty;

        [MaxLength(120)]
        public string CustomerAddress { get; set; } = string.Empty;

        [MaxLength(50)]
        public string CourierId { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Source { get; set; } = "WebStore";

        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;

        [MaxLength(3)]
        public string Size { get; set; } = string.Empty;

        public int Quantity { get; set; }

        [MaxLength(30)]
        public string Status { get; set; } = "PendingApproval";

        [MaxLength(450)]
        public string? ApprovedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ApprovedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
