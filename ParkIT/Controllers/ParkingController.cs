using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.DTOs;
using ParkIT.Models;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ParkIT.Controllers
{
    [Route("api/parking")]
    [ApiController]
    [Authorize] // ✅ Requires authentication
    public class ParkingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParkingController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/parking (Users see their own parking spots, Admins see all)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetUserParkingSpots()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(new { message = "User ID not found in token." });

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            IQueryable<ParkingSpot> query = _context.ParkingSpots;

            if (!string.Equals(userRole, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.UserId == userId);
            }

            var spaces = await query.Select(p => new ParkingSpotDto
            {
                Id = p.Id,
                Address = p.Address,
                FormattedAddress = p.FormattedAddress,
                PlaceId = p.PlaceId,
                PricePerHour = p.PricePerHour,
                Type = p.Type,
                Capacity = p.Capacity,
                Availability = p.Availability,
                Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,
                Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0,
                Description = p.Description
            }).ToListAsync();

            return Ok(spaces);
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

            // ✅ Validate Latitude & Longitude
            if (parkingSpotDto.Latitude == 0 || parkingSpotDto.Longitude == 0)
            {
                return BadRequest(new { message = "Invalid GPS coordinates." });
            }

            var newSpot = new ParkingSpot
            {
                UserId = userId,
                Address = parkingSpotDto.Address,
                FormattedAddress = parkingSpotDto.FormattedAddress,
                PlaceId = parkingSpotDto.PlaceId,
                PricePerHour = parkingSpotDto.PricePerHour,
                Type = parkingSpotDto.Type,
                Capacity = parkingSpotDto.Capacity,
                Availability = parkingSpotDto.Availability,
                GeoLocation = geometryFactory.CreatePoint(new Coordinate(parkingSpotDto.Longitude, parkingSpotDto.Latitude)), // ✅ Convert to Point
                Description = parkingSpotDto.Description
            };

            _context.ParkingSpots.Add(newSpot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserParkingSpots), new { id = newSpot.Id }, newSpot);
        }

        // ✅ PUT: api/parking/{id} (Only Owners/Admins can edit)
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
            if (!string.Equals(userRole, "Admin", System.StringComparison.OrdinalIgnoreCase) && spot.UserId != userId)
            {
                return Unauthorized(new { message = "Access denied." });
            }

            spot.Address = parkingSpotDto.Address;
            spot.FormattedAddress = parkingSpotDto.FormattedAddress;
            spot.PlaceId = parkingSpotDto.PlaceId;
            spot.PricePerHour = parkingSpotDto.PricePerHour;
            spot.Type = parkingSpotDto.Type;
            spot.Capacity = parkingSpotDto.Capacity;
            spot.Availability = parkingSpotDto.Availability;
            spot.GeoLocation = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326)
                .CreatePoint(new Coordinate(parkingSpotDto.Longitude, parkingSpotDto.Latitude)); // ✅ Update location
            spot.Description = parkingSpotDto.Description;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Parking spot updated successfully." });
        }

        // ✅ DELETE: api/parking/{id} (Only Owners/Admins can delete)
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
            if (!string.Equals(userRole, "Admin", System.StringComparison.OrdinalIgnoreCase) && spot.UserId != userId)
            {
                return Unauthorized(new { message = "You do not have permission to delete this parking spot." });
            }

            _context.ParkingSpots.Remove(spot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Parking spot deleted successfully." });
        }
    }
}
