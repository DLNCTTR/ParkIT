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
using System.Text.Json;
using System.Threading.Tasks;

namespace ParkIT.Controllers
{
    [Route("api/parking")]
    [ApiController]
    [Authorize]
    public class ParkingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParkingController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/parking
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetUserParkingSpots()
        {
            Console.WriteLine("🔍 [GET] Fetching Parking Spots...");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                Console.WriteLine("❌ User ID Not Found");
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            Console.WriteLine($"🛠️ User: {userId} | Role: {userRole}");

            IQueryable<ParkingSpot> query = _context.ParkingSpots.AsNoTracking();

            if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.UserId == userId);
            }

            var spaces = await query
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    FormattedAddress = p.FormattedAddress ?? "Unknown",
                    PlaceId = p.PlaceId ?? "Unknown",
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    Capacity = p.Capacity,
                    Availability = p.Availability,
                    Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,
                    Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0,
                    Description = p.Description ?? "No description available"
                })
                .ToListAsync();

            Console.WriteLine($"✅ Found {spaces.Count} Parking Spots.");
            return Ok(spaces);
        }

        // ✅ POST: api/parking
        [HttpPost]
        public async Task<IActionResult> CreateParkingSpot([FromBody] ParkingSpotDto parkingSpotDto)
        {
            Console.WriteLine("🛠️ [POST] Creating a New Parking Spot...");

            if (parkingSpotDto == null)
            {
                Console.WriteLine("❌ Received NULL payload.");
                return BadRequest(new { message = "Invalid data received." });
            }

            try
            {
                Console.WriteLine("📩 Incoming Data:");
                Console.WriteLine(JsonSerializer.Serialize(parkingSpotDto, new JsonSerializerOptions { WriteIndented = true }));

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    Console.WriteLine("❌ User ID Not Found in Token");
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var userId = int.Parse(userIdClaim.Value);
                Console.WriteLine($"🛠️ Creating Parking Spot for User: {userId}");

                // ✅ Validate Data
                if (parkingSpotDto.PricePerHour < 0 || parkingSpotDto.PricePerHour > 1000)
                {
                    Console.WriteLine("❌ Invalid Price Per Hour.");
                    return BadRequest(new { message = "Invalid price per hour. Must be between 0 and 1000." });
                }

                if (parkingSpotDto.Capacity < 1)
                {
                    Console.WriteLine("❌ Invalid Capacity.");
                    return BadRequest(new { message = "Capacity must be at least 1." });
                }

                if (!IsValidNumber(parkingSpotDto.Latitude) || !IsValidNumber(parkingSpotDto.Longitude))
                {
                    Console.WriteLine("❌ Invalid GPS Coordinates.");
                    return BadRequest(new { message = "Invalid GPS coordinates provided." });
                }

                // ✅ Create ParkingSpot Object
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var newSpot = new ParkingSpot
                {
                    UserId = userId,
                    Address = parkingSpotDto.Address ?? "Unknown Address",
                    FormattedAddress = parkingSpotDto.FormattedAddress ?? "Unknown",
                    PlaceId = parkingSpotDto.PlaceId ?? "Unknown",
                    PricePerHour = Math.Round(parkingSpotDto.PricePerHour, 2),
                    Type = parkingSpotDto.Type ?? "Unknown",
                    Capacity = parkingSpotDto.Capacity,
                    Availability = parkingSpotDto.Availability,
                    GeoLocation = geometryFactory.CreatePoint(new Coordinate(parkingSpotDto.Longitude, parkingSpotDto.Latitude)),
                    Description = parkingSpotDto.Description ?? "No description provided."
                };

                Console.WriteLine("✅ Parking Spot Object Created Successfully.");
                
                // ✅ Save to DB
                _context.ParkingSpots.Add(newSpot);
                await _context.SaveChangesAsync();

                Console.WriteLine("✅ Parking Spot Saved in Database!");
                return CreatedAtAction(nameof(GetUserParkingSpots), new { id = newSpot.Id }, newSpot);
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"❌ Database Error: {dbEx.InnerException?.Message ?? dbEx.Message}");
                return StatusCode(500, new { message = "Database error.", error = dbEx.InnerException?.Message ?? dbEx.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR: {ex}");
                return StatusCode(500, new { message = "Internal server error.", error = ex.ToString() });
            }
        }

        // ✅ Utility Method to Validate Numbers
        private bool IsValidNumber(double? number)
        {
            if (number == null)
            {
                Console.WriteLine("❌ Number is NULL.");
                return false;
            }

            if (double.IsNaN(number.Value) || double.IsInfinity(number.Value))
            {
                Console.WriteLine($"❌ Invalid Number Detected: {number}");
                return false;
            }

            return true;
        }
    }
}
