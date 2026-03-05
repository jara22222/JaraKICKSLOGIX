namespace Server.DTO.WorkflowDto
{
    public class BranchManagerSupplierReplenishmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string Partner { get; set; } = string.Empty;
        public int Items { get; set; }
        public DateTime Created { get; set; }
        public DateTime Eta { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
