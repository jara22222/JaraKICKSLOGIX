using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;


namespace Server.Models
{
    public class Users: IdentityUser
    {
        [MaxLength(20)]
        public string FirstName { get; set; } = string.Empty;
        [MaxLength(1)]
        public string MiddleName { get; set; } = string.Empty;
        [MaxLength(20)]
        public string LastName { get; set; } = string.Empty;
        [MaxLength(50)]
        public string? Branch { get; set; } = string.Empty;
        [MaxLength(50)]
        public string Address { get; set; } = string.Empty;
        public string IsActive { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}