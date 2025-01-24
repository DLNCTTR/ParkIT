using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ParkIT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParkingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParkingController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/parking
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParkingSpotDto>>> GetParkingSpots()
        {
            try
            {
                var spaces = await _context.ParkingSpots
                    .Select(p => new ParkingSpotDto
                    {
                        Id = p.Id,
                        Location = p.Location,
                        PricePerHour = p.PricePerHour,
                        Type = p.Type,
                        Capacity = p.Capacity,
                        Available = p.Available,
                        Latitude = p.Latitude,
                        Longitude = p.Longitude
                    })
                    .ToListAsync();

                return Ok(spaces);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/parking/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingSpotDto>> GetParkingSpot(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid parking spot ID.");
            }

            var spot = await _context.ParkingSpots
                .Where(p => p.Id == id)
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Location = p.Location,
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    Capacity = p.Capacity,
                    Available = p.Available,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude
                })
                .FirstOrDefaultAsync();

            if (spot == null)
            {
                return NotFound("Parking spot not found.");
            }

            return Ok(spot);
        }
    }
}
