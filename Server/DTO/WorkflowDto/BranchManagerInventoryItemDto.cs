namespace Server.DTO.WorkflowDto
{
    public class BranchManagerInventoryItemDto
    {
        public string BinLocation { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
