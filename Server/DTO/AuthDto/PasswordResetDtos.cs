using System.ComponentModel.DataAnnotations;

namespace Server.DTO.AuthDto
{
    public class BranchForgotPasswordRequestDto
    {
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required, MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required, MinLength(12), MaxLength(100)]
        public string NewPassword { get; set; } = string.Empty;

        [Required, MinLength(12), MaxLength(100)]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ResolveResetAccountDto
    {
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(450)]
        public string UserId { get; set; } = string.Empty;
    }
}
