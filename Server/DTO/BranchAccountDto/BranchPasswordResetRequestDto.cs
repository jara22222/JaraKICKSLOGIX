namespace Server.DTO.BranchAccountDto
{
    public class BranchPasswordResetRequestDto
    {
        public string RequestId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string RequestedByFirstName { get; set; } = string.Empty;
        public string RequestedByLastName { get; set; } = string.Empty;
        public string RequestedByEmail { get; set; } = string.Empty;
        public string RequestedByAddress { get; set; } = string.Empty;
        public string RequestedRoleName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string RequestedAt { get; set; } = string.Empty;
        public string? ReviewedAt { get; set; }
        public string? ReviewedByUserName { get; set; }
        public string? ReviewRemarks { get; set; }
    }

    public class ReviewPasswordResetRequestDto
    {
        public string? Remarks { get; set; }
    }
}
