using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.DTOs;
using ParkIT.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                .Where(p => p.Availability) // ✅ Only return available spots
                .Select(p => new ParkingSpotDto
                {
                    Id = p.Id,
                    Address = p.Address, // ✅ Updated from "Location"
                    FormattedAddress = p.FormattedAddress, // ✅ Structured readable address
                    PlaceId = p.PlaceId, // ✅ Unique Google Place ID
                    PricePerHour = p.PricePerHour,
                    Type = p.Type,
                    Capacity = p.Capacity,
                    Availability = p.Availability,
                    Latitude = p.GeoLocation == null ? 0 : p.GeoLocation.Y,
                    Longitude = p.GeoLocation == null ? 0 : p.GeoLocation.X
                })
                .ToListAsync();

            return Ok(spaces);
        }
    }
}