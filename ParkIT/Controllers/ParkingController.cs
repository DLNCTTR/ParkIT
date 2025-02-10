using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.DTOs;
using ParkIT.Models;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkIT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // ✅ Requires authentication
    public class ParkingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParkingController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/parking (Admins see all, Users see their own)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetParkingSpots()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            IQueryable<ParkingSpot> query = _context.ParkingSpots;

            if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.UserId == userId);
            }

            var spaces = await query.Select(p => new ParkingSpotDto
            {
                Id = p.Id,
                Location = p.Location,
                PricePerHour = p.PricePerHour,
                Type = p.Type,
                Capacity = p.Capacity,
                Availability = p.Availability,
                Latitude = p.GeoLocation == null ? 0 : p.GeoLocation.Y,
                Longitude = p.GeoLocation == null ? 0 : p.GeoLocation.X
            }).ToListAsync();

            return Ok(spaces);
        }

        // ✅ GET: api/parking/{id} (Only Owners/Admins Can Access)
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingSpotDto>> GetParkingSpot(int id)
        {
            if (id <= 0) return BadRequest(new { message = "Invalid parking spot ID." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null) return NotFound(new { message = "Parking spot not found." });

            // ✅ Ensure only the owner or an admin can access
            if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase) && spot.UserId != userId)
            {
                return Unauthorized(new { message = "Access denied." });
            }

            return Ok(new ParkingSpotDto
            {
                Id = spot.Id,
                Location = spot.Location,
                PricePerHour = spot.PricePerHour,
                Type = spot.Type,
                Capacity = spot.Capacity,
                Availability = spot.Availability,
                Latitude = spot.GeoLocation?.Y ?? 0,
                Longitude = spot.GeoLocation?.X ?? 0
            });
        }

        // ✅ POST: api/parking (Users can add their own, Admins can add any)
        [HttpPost]
        public async Task<IActionResult> CreateParkingSpot([FromBody] ParkingSpotDto parkingSpotDto)
        {
            if (!ModelState.IsValid) return BadRequest(new { message = "Invalid data provided." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim.Value);
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            // ✅ Ensure no duplicate spots for the same location by the same user
            var existingSpot = await _context.ParkingSpots
                .FirstOrDefaultAsync(p => p.UserId == userId && p.Location == parkingSpotDto.Location);

            if (existingSpot != null)
            {
                return BadRequest(new { message = "You already have a parking spot at this location." });
            }

            var newSpot = new ParkingSpot
            {
                UserId = userId,
                Location = parkingSpotDto.Location,
                PricePerHour = parkingSpotDto.PricePerHour,
                Type = parkingSpotDto.Type,
                Capacity = parkingSpotDto.Capacity,
                Availability = parkingSpotDto.Availability,
                GeoLocation = geometryFactory.CreatePoint(new Coordinate(parkingSpotDto.Longitude, parkingSpotDto.Latitude))
            };

            _context.ParkingSpots.Add(newSpot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetParkingSpot), new { id = newSpot.Id }, newSpot);
        }

        // ✅ PUT: api/parking/{id} (Only Owners or Admins can edit)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParkingSpot(int id, [FromBody] ParkingSpotDto parkingSpotDto)
        {
            if (!ModelState.IsValid) return BadRequest(new { message = "Invalid data provided." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null) return NotFound(new { message = "Parking spot not found." });

            // ✅ Ensure only the owner or an admin can edit
            if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase) && spot.UserId != userId)
            {
                return Unauthorized(new { message = "You do not have permission to edit this parking spot." });
            }

            spot.Location = parkingSpotDto.Location;
            spot.PricePerHour = parkingSpotDto.PricePerHour;
            spot.Type = parkingSpotDto.Type;
            spot.Capacity = parkingSpotDto.Capacity;
            spot.Availability = parkingSpotDto.Availability;
            spot.GeoLocation = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326)
                .CreatePoint(new Coordinate(parkingSpotDto.Longitude, parkingSpotDto.Latitude));

            await _context.SaveChangesAsync();

            return Ok(new { message = "Parking spot updated successfully." });
        }

        // ✅ DELETE: api/parking/{id} (Only Owners or Admins can delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParkingSpot(int id)
        {
            if (id <= 0) return BadRequest(new { message = "Invalid parking spot ID." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null) return NotFound(new { message = "Parking spot not found." });

            // ✅ Ensure only the owner or an admin can delete
            if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase) && spot.UserId != userId)
            {
                return Unauthorized(new { message = "You do not have permission to delete this parking spot." });
            }

            _context.ParkingSpots.Remove(spot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Parking spot deleted successfully." });
        }
    }
}
