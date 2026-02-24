using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace Server.DTO
{
    public class ManagerDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; } = string.Empty;
        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;
        [StringLength(50)]
        [Required]
        public string Address { get; set; } = string.Empty;
        [StringLength(50)]
        [Required]
        public string Branch { get; set; } = string.Empty;
        [EmailAddress]
        [Required]
        public string Email { get; set; } = string.Empty;
       
       
    }
}