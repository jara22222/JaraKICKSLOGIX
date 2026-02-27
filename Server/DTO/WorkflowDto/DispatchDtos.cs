using System.ComponentModel.DataAnnotations;

namespace Server.DTO.WorkflowDto
{
    public class DispatchOrderDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
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
}
