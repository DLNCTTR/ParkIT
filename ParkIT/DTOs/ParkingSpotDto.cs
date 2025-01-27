namespace ParkIT.DTOs
{
    public class ParkingSpotDto
    {
        public int Id { get; set; }
        public string Location { get; set; }
        public decimal PricePerHour { get; set; }
        public string Type { get; set; }
        public int Capacity { get; set; }
        public bool Availability { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}