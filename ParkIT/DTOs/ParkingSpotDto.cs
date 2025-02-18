using System.Text.Json.Serialization;

public class ParkingSpotDto
{
    public int Id { get; set; }
    public string Address { get; set; }
    public string FormattedAddress { get; set; }
    public string PlaceId { get; set; }
    public decimal PricePerHour { get; set; }
    public string Type { get; set; }
    public int Capacity { get; set; }
    public bool Availability { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Description { get; set; }

    [JsonIgnore]  // ✅ Prevents circular reference issues
    public NetTopologySuite.Geometries.Point GeoLocation { get; set; }
}