namespace Server.DTO.WorkflowDto
{
    public class ReceiverLogDto
    {
        public string MovementId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? ProductId { get; set; }
        public string? BinId { get; set; }
        public DateTime OccurredAt { get; set; }
    }
}
