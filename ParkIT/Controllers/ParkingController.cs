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
                if (!_context.ParkingSpots.Any())
                {
                    return NotFound("No parking spots available.");
                }

                var spaces = await _context.ParkingSpots
                    .Select(p => new ParkingSpotDto
                    {
                        Id = p.Id,
                        Location = p.Location,
                        PricePerHour = p.PricePerHour,
                        Type = p.Type,
                        Capacity = p.Capacity,
                        Availability = p.Availability,
                        Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,  // Extract from Point
                        Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0  // Extract from Point
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

            try
            {
                var spot = await _context.ParkingSpots
                    .Where(p => p.Id == id)
                    .Select(p => new ParkingSpotDto
                    {
                        Id = p.Id,
                        Location = p.Location,
                        PricePerHour = p.PricePerHour,
                        Type = p.Type,
                        Capacity = p.Capacity,
                        Availability = p.Availability,
                        Latitude = p.GeoLocation != null ? p.GeoLocation.Y : 0,  
                        Longitude = p.GeoLocation != null ? p.GeoLocation.X : 0  
                    })
                    .FirstOrDefaultAsync();

                if (spot == null)
                {
                    return NotFound("Parking spot not found.");
                }

                return Ok(spot);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/parking
        [HttpPost]
        public async Task<IActionResult> CreateParkingSpot([FromBody] ParkingSpotDto parkingSpotDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid data provided.");
            }

            try
            {
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

                var newSpot = new ParkingSpot
                {
                    Location = parkingSpotDto.Location,
                    PricePerHour = parkingSpotDto.PricePerHour,
                    Type = parkingSpotDto.Type,
                    Capacity = parkingSpotDto.Capacity,
                    Availability = parkingSpotDto.Availability,
                    GeoLocation = geometryFactory.CreatePoint(new Coordinate(parkingSpotDto.Longitude, parkingSpotDto.Latitude))
                };

                _context.ParkingSpots.Add(newSpot);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetParkingSpot), new { id = newSpot.Id }, parkingSpotDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
