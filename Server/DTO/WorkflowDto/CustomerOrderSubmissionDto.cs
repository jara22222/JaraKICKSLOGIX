using System.ComponentModel.DataAnnotations;

namespace Server.DTO.WorkflowDto
{
    public class CustomerOrderSubmissionDto
    {
        [Required]
        [StringLength(50)]
        public string Branch { get; set; } = string.Empty;

        [Required]
        [StringLength(80)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [StringLength(120)]
        public string CustomerAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CourierId { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string SKU { get; set; } = string.Empty;

        [Required]
        [StringLength(3)]
        public string Size { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
