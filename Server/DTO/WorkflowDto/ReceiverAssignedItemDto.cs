namespace Server.DTO.WorkflowDto
{
    public class ReceiverAssignedItemDto
    {
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string WorkflowStatus { get; set; } = string.Empty;
        public string BinId { get; set; } = string.Empty;
        public string BinLocation { get; set; } = string.Empty;
        public string ItemQrString { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
    }
}
