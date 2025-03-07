using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace ParkIT.Models
{
    public class ParkingSpot
    {
        [Key]
        [Required]
        public int Id { get; set; }

        // Full Address for Display & Search
        [Required(ErrorMessage = "Address is required.")]
        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters.")]
        public string Address { get; set; }

        // Formatted Address from Google Places API
        [StringLength(300, ErrorMessage = "Formatted address cannot exceed 300 characters.")]
        public string FormattedAddress { get; set; }

        // Google Place ID for Unique Identification
        [StringLength(100)]
        public string PlaceId { get; set; }

        // Price per hour field
        [Required(ErrorMessage = "Price per hour is required.")]
        [Range(0, 1000, ErrorMessage = "Price per hour must be between 0 and 1000.")]
        public decimal PricePerHour { get; set; }

        // Type of parking spot (e.g., Covered, Open, Reserved, etc.)
        [Required(ErrorMessage = "Type is required.")]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters.")]
        public string Type { get; set; }
        
        // Total Capacity (number of vehicles it can hold)
        [Required(ErrorMessage = "Capacity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1.")]
        public int TotalCapacity { get; set; }
        
        [Required(ErrorMessage = "Current Capacity is required.")]
        [Range(0, int.MaxValue, ErrorMessage = "Current Capacity cannot be negative.")]
        public int CurrentCapacity { get; set; }  // New field
        

        // Availability status (True = Available, False = Occupied)
        [Required(ErrorMessage = "Availability status is required.")]
        public bool Availability { get; set; }

        // User ID - Tracks the owner of the parking spot
        [Required(ErrorMessage = "UserId is required to track the owner of the parking spot.")]
        [ForeignKey("User")]
        public int UserId { get; set; }

        // Relationship with User (1 User -> Many ParkingSpots)
        [InverseProperty("ParkingSpots")] 
        public virtual User User { get; set; } 

        // Storing geolocation as a spatial point (for accurate location search)
        [Required]
        [Column(TypeName = "geography")]
        public Point GeoLocation { get; set; }

        // Latitude field, derived from GeoLocation
        [NotMapped] 
        public double Latitude => GeoLocation?.Y ?? 0; 

        // Longitude field, derived from GeoLocation
        [NotMapped] 
        public double Longitude => GeoLocation?.X ?? 0; 

        // Additional description for the parking spot
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; }

        // Constructor to ensure GeoLocation is initialized
        public ParkingSpot()
        {
            // Default location set to (0,0) to prevent null issues
            GeoLocation = new Point(0, 0) { SRID = 4326 };
        }
    }
}
