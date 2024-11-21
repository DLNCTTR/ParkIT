using System.ComponentModel.DataAnnotations;

namespace ParkIT.Models
{
    public class ParkingSpot
    {
        // Primary Key
        [Key]
        [Required]
        public int Id { get; set; }

        // Location is required and limited to 100 characters
        [Required(ErrorMessage = "Location is required and cannot be empty.")]
        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        public string Location { get; set; }

        // Price per hour (must be a decimal between 0 and 1000)
        [Required(ErrorMessage = "Price per hour is required and must be a valid decimal.")]
        [Range(0, 1000, ErrorMessage = "Price per hour must be between 0 and 1000.")]
        public decimal PricePerHour { get; set; }

        // Parking spot type (e.g., regular, handicap) limited to 50 characters
        [Required(ErrorMessage = "Type is required and cannot exceed 50 characters.")]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters.")]
        public string Type { get; set; }

        // Capacity (must be an integer greater than 0)
        [Required(ErrorMessage = "Capacity is required and must be a positive number.")]
        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1.")]
        public int Capacity { get; set; }

        // Boolean indicating availability of the parking spot, defaulting to true
        [Required(ErrorMessage = "Availability status is required.")]
        public bool Availability { get; set; } = true;

        // Optional owner field (limited to 50 characters)
        [StringLength(50, ErrorMessage = "Owner name cannot exceed 50 characters.")]
        public string Owner { get; set; }

        // Optional description (limited to 500 characters)
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; } = string.Empty;
    }
}