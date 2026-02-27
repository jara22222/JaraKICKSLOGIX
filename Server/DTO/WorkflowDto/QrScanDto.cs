using System.ComponentModel.DataAnnotations;

namespace Server.DTO.WorkflowDto
{
    public class QrScanDto
    {
        [Required]
        public string QrValue { get; set; } = string.Empty;
    }
}
