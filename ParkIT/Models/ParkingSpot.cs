using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries; // Required for spatial data handling

namespace ParkIT.Models
{
    public class ParkingSpot
    {
        [Key]
        [Required]
        public int Id { get; set; }

        [Required(ErrorMessage = "Location is required and cannot be empty.")]
        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        public string Location { get; set; }

        [Required(ErrorMessage = "Price per hour is required and must be a valid decimal.")]
        [Range(0, 1000, ErrorMessage = "Price per hour must be between 0 and 1000.")]
        public decimal PricePerHour { get; set; }

        [Required(ErrorMessage = "Type is required and cannot exceed 50 characters.")]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters.")]
        public string Type { get; set; }

        [Required(ErrorMessage = "Capacity is required and must be a positive number.")]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1.")]
        public int Capacity { get; set; }

        [Required(ErrorMessage = "Availability status is required.")]
        public bool Availability { get; set; } // Matches the "Availability" column in your database

        // ✅ New: User ID - Tracks the owner of the parking spot
        [Required(ErrorMessage = "UserId is required to track the owner of the parking spot.")]
        public int UserId { get; set; }

        // ✅ New: Establishes Relationship with User
        [ForeignKey("UserId")]
        public User User { get; set; } 

        // Latitude field, automatically derived from GeoLocation
        public double Latitude => GeoLocation?.Y ?? 0; // Y = Latitude

        // Longitude field, automatically derived from GeoLocation
        public double Longitude => GeoLocation?.X ?? 0; // X = Longitude

        // Storing geolocation as a spatial point
        public Point GeoLocation { get; set; }
    }
}
