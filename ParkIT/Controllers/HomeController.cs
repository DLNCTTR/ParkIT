using Microsoft.AspNetCore.Mvc; // Required for API controllers
using ParkIT.Data; // Required for database context
using ParkIT.Models; // Required for model classes
using System.Linq; // Required for LINQ queries

namespace ParkIT.Controllers
{
    // This controller manages parking-related API endpoints
    [ApiController] // Marks this as an API controller (no Razor views)
    [Route("api/[controller]")] // Sets the base route for this controller
    public class HomePageController : ControllerBase
    {
        private readonly AppDbContext _dbContext; // Database context for accessing data

        // Constructor for dependency injection of the database context
        public HomePageController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("parking-spaces")] // API endpoint: /api/parking/parking-spaces
        public IActionResult GetParkingSpaces()
        {
            var spaces = _dbContext.ParkingSpots.ToList(); // Fetch all parking spots from the database
            return Ok(spaces); // Return the list of parking spots as JSON
        }

        [HttpGet("parking-space/{id}")] // API endpoint: /api/parking/parking-space/{id}
        public IActionResult GetParkingSpace(int id)
        {
            var space = _dbContext.ParkingSpots.FirstOrDefault(p => p.Id == id); // Find parking space by ID

            if (space == null)
            {
                return NotFound(); // Return 404 if the parking space is not found
            }

            return Ok(space); // Return the parking space details as JSON
        }

        [HttpPost("parking-space")] // API endpoint: /api/parking/parking-space
        public IActionResult AddParkingSpace([FromBody] ParkingSpot parkingSpace)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return 400 if the model is invalid
            }

            _dbContext.ParkingSpots.Add(parkingSpace); // Add the new parking space to the database
            _dbContext.SaveChanges(); // Save changes to the database

            return CreatedAtAction(nameof(GetParkingSpace), new { id = parkingSpace.Id }, parkingSpace); // Return 201 with the created resource
        }
    }
}
