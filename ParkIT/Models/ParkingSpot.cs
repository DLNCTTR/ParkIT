using System.ComponentModel.DataAnnotations;

namespace ParkIT.Models
{
    public class ParkingSpot
    {
        // Primary Key
        public int Id { get; set; }

        // Location is required
        [Required(ErrorMessage = "Location is required.")]
        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        public string Location { get; set; }

        // Price per hour with currency format
        [Required(ErrorMessage = "Price per hour is required.")]
        [Range(0, 1000, ErrorMessage = "Price per hour must be between 0 and 1000.")]
        [DataType(DataType.Currency)]
        [Display(Name = "Price per Hour (€)")]
        public decimal PricePerHour { get; set; }

        // Type of parking spot (e.g., regular, handicap, etc.)
        [Required(ErrorMessage = "Type is required.")]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters.")]
        public string Type { get; set; }

        // Capacity for vehicles (must be positive)
        [Required(ErrorMessage = "Capacity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1.")]
        public int Capacity { get; set; }

        // Availability status of the parking spot
        [Required]
        public bool Availability { get; set; }

        // Optional owner of the parking spot
        [StringLength(50, ErrorMessage = "Owner name cannot exceed 50 characters.")]
        public string Owner { get; set; }

        // Description of the parking spot (optional, allows longer text)
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        [DataType(DataType.MultilineText)]
        public string Description { get; set; }
    }
}