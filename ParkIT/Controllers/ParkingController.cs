using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.Models;
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

        [HttpGet("list")]
        public async Task<IActionResult> GetParkingSpots()
        {
            var spots = await _context.ParkingSpots.ToListAsync();
            return Ok(spots);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddParkingSpot([FromBody] ParkingSpot spot)
        {
            _context.ParkingSpots.Add(spot);
            await _context.SaveChangesAsync();
            return Ok(spot);
        }
    }
}