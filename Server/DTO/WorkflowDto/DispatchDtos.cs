using System.ComponentModel.DataAnnotations;

namespace Server.DTO.WorkflowDto
{
    public class DispatchOrderDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string BinLocation { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public string CourierId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ConfirmDispatchQtyDto
    {
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class BranchOutboundLogDto
    {
        public string PickId { get; set; } = string.Empty;
        public string OrderRef { get; set; } = string.Empty;
        public string Product { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int QtyPicked { get; set; }
        public string PickedByName { get; set; } = string.Empty;
        public string PickedByTime { get; set; } = string.Empty;
        public string BinLocation { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class DispatchActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }
}
