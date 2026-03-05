namespace Server.DTO
{
    public class BinLocationCreateDto
    {
        public string BinLocation { get; set; } = string.Empty;
        public string BinSize { get; set; } = string.Empty;
        public int BinCapacity { get; set; }
    }

    public class BinLocationUpdateDto
    {
        public string BinLocation { get; set; } = string.Empty;
        public string BinSize { get; set; } = string.Empty;
        public int BinCapacity { get; set; }
        public string BinStatus { get; set; } = string.Empty;
    }

    public class BinLocationListItemDto
    {
        public string BinId { get; set; } = string.Empty;
        public string BinLocation { get; set; } = string.Empty;
        public string BinStatus { get; set; } = string.Empty;
        public string BinSize { get; set; } = string.Empty;
        public int BinCapacity { get; set; }
        public int OccupiedQty { get; set; }
        public string QrCodeString { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
