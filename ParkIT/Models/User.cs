using System.ComponentModel.DataAnnotations;

namespace ParkIT.Models
{
    public class User
    {
        // Primary Key
        public int Id { get; set; }

        // Username is required and limited to 50 characters
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
        public string Username { get; set; }

        // Password is required and must meet complexity standards
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
        public string Password { get; set; }

        // Role of the user (e.g., admin, regular user) - optional, defaulting to a regular user
        [StringLength(20, ErrorMessage = "Role cannot exceed 20 characters.")]
        public string Role { get; set; } = "User"; // Default role is "User"

        // Optional email address for user identification
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string Email { get; set; }
    }
}