using System.ComponentModel.DataAnnotations;

namespace Server.DTO.WorkflowDto
{
    public class SupplierProductSubmissionDto
    {
        [StringLength(120)]
        public string? SupplierName { get; set; } = string.Empty;

        [StringLength(80)]
        public string? Branch { get; set; } = string.Empty;

        [Required]
        [StringLength(80)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? SKU { get; set; } = string.Empty;

        [StringLength(3)]
        public string? Size { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
