using Microsoft.AspNetCore.Mvc;
using ParkIT.Data;
using ParkIT.Models;
using System.Linq;

namespace ParkIT.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomePageController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public HomePageController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("parking-spaces")]
        public IActionResult GetParkingSpaces()
        {
            var spaces = _dbContext.ParkingSpots.Select(p => new
            {
                p.Id,
                p.Location,
                p.PricePerHour,
                p.Type,
                p.Capacity,
                p.Availability,
                Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,
                Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0
            }).ToList();

            return Ok(spaces);
        }

        [HttpGet("parking-space/{id}")]
        public IActionResult GetParkingSpace(int id)
        {
            var space = _dbContext.ParkingSpots.Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Location,
                    p.PricePerHour,
                    p.Type,
                    p.Capacity,
                    p.Availability,
                    Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,
                    Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0
                })
                .FirstOrDefault();

            if (space == null)
            {
                return NotFound();
            }

            return Ok(space);
        }

        [HttpPost("parking-space")]
        public IActionResult AddParkingSpace([FromBody] ParkingSpot parkingSpace)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _dbContext.ParkingSpots.Add(parkingSpace);
            _dbContext.SaveChanges();

            return CreatedAtAction(nameof(GetParkingSpace), new { id = parkingSpace.Id }, parkingSpace);
        }
    }
}
