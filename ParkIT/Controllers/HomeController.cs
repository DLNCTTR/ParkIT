using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ParkIT.Controllers
{
    [ApiController]
    [Route("api/homepage")]
    public class HomePageController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public HomePageController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// ✅ **Get all parking spaces** (Filter available spots if `onlyAvailable=true`)
        [HttpGet("parking-spaces")]
        public async Task<IActionResult> GetParkingSpaces([FromQuery] bool onlyAvailable = false)
        {
            _dbContext.ChangeTracker.Clear();  // ✅ Correct place to use it
            var query = _dbContext.ParkingSpots.AsQueryable();

            if (onlyAvailable)
            {
                query = query.Where(p => p.Availability);
            }

            var spaces = await query
                .Select(p => new
                {
                    p.Id,
                    p.Address, // ✅ Uses structured address instead of raw location
                    p.FormattedAddress,
                    p.PlaceId,
                    p.PricePerHour,
                    p.Type,
                    TotalCapacity = (int)p.TotalCapacity,  // Updated field
                    CurrentCapacity = (int)p.CurrentCapacity, // New field
                    p.Availability,
                    Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,
                    Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0
                })
                .ToListAsync();

            return Ok(spaces);
        }

        /// ✅ **Get a single parking space by ID**
        [HttpGet("parking-space/{id}")]
        public async Task<IActionResult> GetParkingSpace(int id)
        {
            var space = await _dbContext.ParkingSpots
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Address,
                    p.FormattedAddress,
                    p.PlaceId,
                    p.PricePerHour,
                    p.Type,
                    TotalCapacity = (int)p.TotalCapacity,  // Updated field
                    CurrentCapacity = (int)p.CurrentCapacity, // New field
                    p.Availability,
                    Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,
                    Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0
                })
                .FirstOrDefaultAsync();

            if (space == null)
            {
                return NotFound(new { message = "Parking space not found." });
            }

            return Ok(space);
        }

        /// ✅ **Add a new parking space**
        [HttpPost("parking-space")]
        public async Task<IActionResult> AddParkingSpace([FromBody] ParkingSpot parkingSpace)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // ✅ Validate Total and Current Capacity
            if (parkingSpace.TotalCapacity < 1)
                return BadRequest(new { message = "Total Capacity must be at least 1." });

            if (parkingSpace.CurrentCapacity < 0 || parkingSpace.CurrentCapacity > parkingSpace.TotalCapacity)
                return BadRequest(new { message = "Current Capacity cannot be negative or exceed Total Capacity." });


            // ✅ Ensure valid geo-coordinates
            if (parkingSpace.GeoLocation == null || double.IsNaN(parkingSpace.GeoLocation.X) || double.IsNaN(parkingSpace.GeoLocation.Y))
            {
                return BadRequest(new { message = "Invalid geo-coordinates provided." });
            }

            _dbContext.ParkingSpots.Add(parkingSpace);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetParkingSpace), new { id = parkingSpace.Id }, parkingSpace);
        }
    }
}
