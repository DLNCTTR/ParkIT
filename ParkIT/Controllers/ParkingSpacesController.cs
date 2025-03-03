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
                    Capacity = p.Capacity,
                    Availability = p.Availability,
                    Latitude = p.GeoLocation.Y, // ✅ Use GeoLocation
                    Longitude = p.GeoLocation.X // ✅ Use GeoLocation
                })
                .ToListAsync();

            return Ok(spaces);
        }

        // ✅ GET: api/homepage/parking-space/{id} (Fetch a single parking spot)
        [HttpGet("~/api/homepage/parking-space/{id}")]
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
                    Capacity = p.Capacity,
                    Availability = p.Availability,
                    Latitude = p.GeoLocation.Y,
                    Longitude = p.GeoLocation.X
                })
                .FirstOrDefaultAsync();

            if (parkingSpot == null)
            {
                return NotFound($"Parking spot with ID {id} not found.");
            }

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

            var parkingSpot = new ParkingSpot
            {
                UserId = int.Parse(userId),
                Address = newSpot.Address,
                FormattedAddress = newSpot.FormattedAddress,
                PlaceId = newSpot.PlaceId,
                PricePerHour = newSpot.PricePerHour,
                Type = newSpot.Type,
                Capacity = newSpot.Capacity,
                Availability = newSpot.Availability,
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

            // ✅ Update properties (excluding Latitude & Longitude)
            spot.Address = updatedSpot.Address;
            spot.PricePerHour = updatedSpot.PricePerHour;
            spot.Type = updatedSpot.Type;
            spot.Capacity = updatedSpot.Capacity;
            spot.Availability = updatedSpot.Availability;

            // ✅ Update GeoLocation correctly
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
