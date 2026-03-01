using System.ComponentModel.DataAnnotations;

namespace Server.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        [MaxLength(32, ErrorMessage = "Password cannot exceed 32 characters.")]
        public string Password { get; set; } = string.Empty;
    }
}