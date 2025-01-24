using System.ComponentModel.DataAnnotations;

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
        public bool Available { get; set; }

        // New fields for geographical coordinates
        [Required(ErrorMessage = "Latitude is required.")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90 degrees.")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Longitude is required.")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180 degrees.")]
        public double Longitude { get; set; }
    }
}