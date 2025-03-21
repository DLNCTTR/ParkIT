using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.DTOs;
using ParkIT.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using NetTopologySuite.Geometries;
using NetTopologySuite.Geometries.Prepared;

namespace ParkIT.Controllers
{
    [Route("api/parking-spaces")]
    [ApiController]
    public class ParkingSpacesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParkingSpacesController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/parking-spaces (Fetch all available parking spots)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetAllParkingSpots()
        {
            var spaces = await _context.ParkingSpots
                .Where(p => p.Availability)
                .AsNoTracking()
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    FormattedAddress = p.FormattedAddress,
                    PlaceId = p.PlaceId,
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    TotalCapacity = p.TotalCapacity,  // Updated field
                    CurrentCapacity = p.CurrentCapacity, // New field
                    Availability = p.Availability,
                    Description = p.Description ?? "",
                    Latitude = p.GeoLocation.Y,
                    Longitude = p.GeoLocation.X
                })
                .ToListAsync();

            return Ok(spaces);
        }

        // ✅ NEW: GET /api/parking-spaces/nearby (Fetch parking spots by proximity)
        [HttpGet("nearby")]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetNearbyParkingSpots(
            [FromQuery] double latitude, 
            [FromQuery] double longitude, 
            [FromQuery] double maxDistanceKm = 10)
        {
            var userLocation = new Point(longitude, latitude) { SRID = 4326 };

            var nearbySpots = await _context.ParkingSpots
                .Where(p => p.Availability && p.GeoLocation.IsWithinDistance(userLocation, maxDistanceKm * 1000))
                .OrderBy(p => p.GeoLocation.Distance(userLocation))
                .AsNoTracking()
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    FormattedAddress = p.FormattedAddress,
                    PlaceId = p.PlaceId,
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    TotalCapacity = p.TotalCapacity,  // Updated field
                    CurrentCapacity = p.CurrentCapacity, // New field
                    Availability = p.Availability,
                    Description = p.Description ?? "",
                    Latitude = p.GeoLocation.Y,
                    Longitude = p.GeoLocation.X
                })
                .ToListAsync();

            return Ok(nearbySpots);
        }

        // ✅ GET: api/parking-spaces/my-spots (Fetch user's own parking spots)
        [HttpGet("my-spots")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetUserParkingSpots()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found.");

            var spaces = await _context.ParkingSpots
                .Where(p => p.UserId == int.Parse(userId))
                .AsNoTracking()
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    FormattedAddress = p.FormattedAddress,
                    PlaceId = p.PlaceId,
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    TotalCapacity = p.TotalCapacity,  // Updated field
                    CurrentCapacity = p.CurrentCapacity, // New field
                    Availability = p.Availability,
                    Description = p.Description ?? "",
                    Latitude = p.GeoLocation.Y,
                    Longitude = p.GeoLocation.X
                })
                .ToListAsync();

            return Ok(spaces);
        }

        // ✅ GET: api/parking-spaces/{id} (Fetch a single parking spot)
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingSpotDto>> GetParkingSpot(int id)
        {
            var parkingSpot = await _context.ParkingSpots
                .Where(p => p.Id == id)
                .AsNoTracking()
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    FormattedAddress = p.FormattedAddress,
                    PlaceId = p.PlaceId,
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    TotalCapacity = p.TotalCapacity,  // Updated field
                    CurrentCapacity = p.CurrentCapacity, // New field
                    Availability = p.Availability,
                    Description = p.Description ?? "",
                    Latitude = p.GeoLocation.Y,
                    Longitude = p.GeoLocation.X
                })
                .FirstOrDefaultAsync();

            if (parkingSpot == null)
                return NotFound($"Parking spot with ID {id} not found.");

            return Ok(parkingSpot);
        }

        // ✅ POST: api/parking-spaces (Add new parking spot)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ParkingSpotDto>> AddParkingSpot([FromBody] ParkingSpotDto newSpot)
        {
            if (newSpot == null)
                return BadRequest("Invalid parking spot data.");

            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found.");
            
            // ✅ Validate Total and Current Capacity
            if (newSpot.TotalCapacity < 1)
                return BadRequest("Total Capacity must be at least 1.");
    
            if (newSpot.CurrentCapacity < 0 || newSpot.CurrentCapacity > newSpot.TotalCapacity)
                return BadRequest("Current Capacity cannot be negative or exceed Total Capacity.");

            var parkingSpot = new ParkingSpot
            {
                UserId = int.Parse(userId),
                Address = newSpot.Address,
                FormattedAddress = newSpot.FormattedAddress,
                PlaceId = newSpot.PlaceId,
                PricePerHour = newSpot.PricePerHour,
                Type = newSpot.Type,
                TotalCapacity = newSpot.TotalCapacity,  // Updated field
                CurrentCapacity = newSpot.CurrentCapacity,
                Availability = newSpot.Availability,
                Description = newSpot.Description ?? "",
                GeoLocation = new Point(newSpot.Longitude, newSpot.Latitude) { SRID = 4326 }
            };

            _context.ParkingSpots.Add(parkingSpot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetParkingSpot), new { id = parkingSpot.Id }, parkingSpot);
        }

        // ✅ PUT: api/parking-spaces/{id} (Update a parking spot)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateParkingSpot(int id, [FromBody] ParkingSpotDto updatedSpot)
        {
            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null)
                return NotFound("Parking spot not found.");

            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            if (spot.UserId != int.Parse(userId) && !isAdmin)
                return Forbid();
            
            // ✅ Validate Total and Current Capacity
            if (updatedSpot.TotalCapacity < 1)
                return BadRequest("Total Capacity must be at least 1.");
    
            if (updatedSpot.CurrentCapacity < 0 || updatedSpot.CurrentCapacity > updatedSpot.TotalCapacity)
                return BadRequest("Current Capacity cannot be negative or exceed Total Capacity.");

            spot.Address = updatedSpot.Address;
            spot.PricePerHour = updatedSpot.PricePerHour;
            spot.Type = updatedSpot.Type;
            spot.TotalCapacity = updatedSpot.TotalCapacity;  // Updated field
            spot.CurrentCapacity = updatedSpot.CurrentCapacity; // Updated field
            spot.Availability = updatedSpot.Availability;
            spot.Description = updatedSpot.Description ?? "";
            spot.GeoLocation = new Point(updatedSpot.Longitude, updatedSpot.Latitude) { SRID = 4326 };

            _context.ParkingSpots.Update(spot);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ✅ DELETE: api/parking-spaces/{id} (Delete a parking spot)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteParkingSpot(int id)
        {
            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null)
                return NotFound("Parking spot not found.");

            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            if (spot.UserId != int.Parse(userId) && !isAdmin)
                return Forbid();

            _context.ParkingSpots.Remove(spot);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
