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

        // ✅ GET: api/parking-spaces (Public endpoint for all available parking spots)
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
                    Capacity = p.Capacity,
                    Availability = p.Availability,
                    Latitude = p.GeoLocation.Y, // ✅ Use GeoLocation
                    Longitude = p.GeoLocation.X // ✅ Use GeoLocation
                })
                .ToListAsync();

            return Ok(spaces);
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
                .Where(p => p.UserId == int.Parse(userId)) // ✅ Use UserId
                .AsNoTracking()
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    FormattedAddress = p.FormattedAddress,
                    PlaceId = p.PlaceId,
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    Capacity = p.Capacity,
                    Availability = p.Availability,
                    Latitude = p.GeoLocation.Y, // ✅ Use GeoLocation
                    Longitude = p.GeoLocation.X // ✅ Use GeoLocation
                })
                .ToListAsync();

            return Ok(spaces);
        }

        // ✅ PUT: api/parking-spaces/{id} (Update a parking spot)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateParkingSpot(int id, [FromBody] ParkingSpot updatedSpot)
        {
            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null)
                return NotFound("Parking spot not found.");

            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            if (spot.UserId != int.Parse(userId) && !isAdmin)
                return Forbid();

            // ✅ Update properties (excluding Latitude & Longitude)
            spot.Address = updatedSpot.Address;
            spot.PricePerHour = updatedSpot.PricePerHour;
            spot.Type = updatedSpot.Type;
            spot.Capacity = updatedSpot.Capacity;
            spot.Availability = updatedSpot.Availability;

            // ✅ Correctly update GeoLocation instead of modifying read-only Latitude & Longitude
            spot.GeoLocation = new Point(updatedSpot.GeoLocation.X, updatedSpot.GeoLocation.Y) { SRID = 4326 };

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
