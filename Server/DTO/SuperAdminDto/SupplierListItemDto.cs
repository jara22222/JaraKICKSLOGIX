namespace Server.DTO
{
    public class SupplierListItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool Agreement { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
