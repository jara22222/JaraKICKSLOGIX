using System.ComponentModel.DataAnnotations;

namespace Server.DTO.BranchAccountDto
{
    public class BranchAccountDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; } = string.Empty;
        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;
        [StringLength(50)]
        public string Address { get; set; } = string.Empty;
        [StringLength(256)]
        [Required]
        public string RoleName { get; set; } = string.Empty;
        [EmailAddress]
        [Required]
        public string Email { get; set; } = string.Empty;
    }
}