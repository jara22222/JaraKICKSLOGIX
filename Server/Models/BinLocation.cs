using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    [Table("BinLocation")]
    public class BinLocation
    {
        [Key]
        [Column("BinId")]
        [MaxLength(128)]
        public string BinId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("BinLocation")]
        [MaxLength(20)]
        public string BinLocationCode { get; set; } = string.Empty;

        [Required]
        [Column("BinStatus")]
        [MaxLength(20)]
        public string BinStatus { get; set; } = "Available";

        [Required]
        [Column("BinSize")]
        [MaxLength(3)]
        public string BinSize { get; set; } = "M";

        [Column("BinCapacity")]
        public int BinCapacity { get; set; }

        [Required]
        [Column("QrCodeString")]
        [MaxLength(500)]
        public string QrCodeString { get; set; } = string.Empty;

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
