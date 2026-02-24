namespace Server.DTO
{
    public class AuditLogListItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public DateTime DatePerformed { get; set; }
    }
}
