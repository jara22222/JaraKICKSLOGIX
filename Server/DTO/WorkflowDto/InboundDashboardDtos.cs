namespace Server.DTO.WorkflowDto
{
    public class InboundIncomingShipmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string PoRef { get; set; } = string.Empty;
        public string Supplier { get; set; } = string.Empty;
        public string Product { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Qty { get; set; }
        public string DateSent { get; set; } = string.Empty;
        public string Eta { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class InboundPersonInfoDto
    {
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
    }

    public class InboundLocationInfoDto
    {
        public string Type { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
    }

    public class InboundReceiptDto
    {
        public string Id { get; set; } = string.Empty;
        public string PoRef { get; set; } = string.Empty;
        public string Product { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int Qty { get; set; }
        public InboundPersonInfoDto ReceivedBy { get; set; } = new();
        public InboundPersonInfoDto PutawayBy { get; set; } = new();
        public InboundLocationInfoDto Location { get; set; } = new();
        public string Status { get; set; } = string.Empty;
    }

    public class InboundActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }
}
