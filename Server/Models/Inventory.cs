using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("Inventory")]
    public class Inventory
    {
        [Key]
        [MaxLength(36)]
        public string ProductId { get; set; } = Guid.NewGuid().ToString();

        [MaxLength(450)]
        public string SupplierId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        [MaxLength(80)]
        public string ProductName { get; set; } = string.Empty;

        public virtual Users User { get; set; } = null!;

        public string ItemQty { get; set; } = string.Empty;
        public int QuantityOnHand { get; set; }

        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;

        [MaxLength(3)]
        public string Size { get; set; } = string.Empty;

        [MaxLength(255)]
        public string QrString { get; set; } = string.Empty;

        [MaxLength(20)]
        public int? CriticalThreshold { get; set; }

        [MaxLength(30)]
        public string WorkflowStatus { get; set; } = "PendingPutAway";

        [MaxLength(128)]
        public string? BinId { get; set; }

        public bool IsBinAssigned { get; set; }
        public DateTime DateReceived { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
