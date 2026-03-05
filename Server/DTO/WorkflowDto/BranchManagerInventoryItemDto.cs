namespace Server.DTO.WorkflowDto
{
    public class BranchManagerInventoryItemDto
    {
        public string ProductId { get; set; } = string.Empty;
        public string BinLocation { get; set; } = string.Empty;
        public string BinStatus { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string ItemBatchName { get; set; } = string.Empty;
        public int BatchQty { get; set; }
        public int TotalProductQty { get; set; }
        public string Size { get; set; } = string.Empty;
        public string DatePuted { get; set; } = string.Empty;
        public string DateUpdated { get; set; } = string.Empty;
        public string LowStockStatus { get; set; } = string.Empty;
        public string LowStockApprovalStatus { get; set; } = "N/A";
    }
}
