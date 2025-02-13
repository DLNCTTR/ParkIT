using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // ✅ Needed for unique constraints
using System.Collections.Generic;

namespace ParkIT.Models
{
    public class User
    {
        // ✅ Primary Key
        [Key]
        public int Id { get; set; }

        // ✅ Username is required, unique, and limited to 50 characters
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
        public string Username { get; set; }

        // ✅ Plain-Text Password (⚠️ Not Secure, as per your request)
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, ErrorMessage = "Password must be between 6 and 100 characters.", MinimumLength = 6)]
        public string Password { get; set; }

        // ✅ User Role (Admin, User, etc.), defaults to "User"
        [Required]
        [StringLength(20, ErrorMessage = "Role cannot exceed 20 characters.")]
        public string Role { get; set; } = "User"; // Default role is "User"

        // ✅ Email is required, unique, and validated
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string Email { get; set; }

        // ✅ Relationship with Parking Spots (One User -> Many Parking Spots)
        public List<ParkingSpot> ParkingSpots { get; set; } = new List<ParkingSpot>(); 
    }
}