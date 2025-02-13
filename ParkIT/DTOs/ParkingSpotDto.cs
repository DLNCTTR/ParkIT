namespace ParkIT.DTOs
{
    public class ParkingSpotDto
    {
        public int Id { get; set; }

        // ✅ New: Full Address for Display & Search
        public string Address { get; set; }

        // ✅ New: Formatted Address from Google Places API
        public string FormattedAddress { get; set; }

        // ✅ New: Google Place ID for Unique Identifications
        public string PlaceId { get; set; }

        // ✅ Price per hour field
        public decimal PricePerHour { get; set; }

        // ✅ Type of parking spot (e.g., Covered, Open, Reserved, etc.)
        public string Type { get; set; }

        // ✅ Capacity (number of vehicles it can hold)
        public int Capacity { get; set; }

        // ✅ Availability status (True = Available, False = Occupied)
        public bool Availability { get; set; }

        // ✅ Latitude
        public double Latitude { get; set; }

        // ✅ Longitude
        public double Longitude { get; set; }

        // ✅ New: Additional description for the parking spot
        public string Description { get; set; }
    }
}