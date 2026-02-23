using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Models;
namespace Server.Models
{
    public class Products
    {
        [Key]
        [MaxLength(36)]
        public string ProductId { get; set; } = Guid.NewGuid().ToString(); 
        [MaxLength(450)]
        public string SupplierId { get; set; } = string.Empty;
        public virtual Users User { get; set; } = null!;
        public string ItemQty { get; set; } = string.Empty;
        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;
        [MaxLength(3)]
        public string Size { get; set; } = string.Empty;
        [MaxLength(255)]
        public string QrString { get; set; }
        [MaxLength(20)]
        public int? CriticalThreshold { get; set; }
        public DateTime DateReceived { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}