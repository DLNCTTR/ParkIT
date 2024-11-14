using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ParkIT.Data;
using ParkIT.Models;

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
        public async Task<ActionResult<IEnumerable<ParkingSpot>>> GetParkingSpots()
        {
            return await _context.ParkingSpots.ToListAsync();
        }

        // GET: api/parking/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingSpot>> GetParkingSpot(int id)
        {
            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null)
            {
                return NotFound();
            }
            return spot;
        }

        // POST: api/parking
        [HttpPost]
        public async Task<ActionResult<ParkingSpot>> PostParkingSpot(ParkingSpot spot)
        {
            _context.ParkingSpots.Add(spot);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetParkingSpot), new { id = spot.Id }, spot);
        }

        // PUT: api/parking/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutParkingSpot(int id, ParkingSpot spot)
        {
            if (id != spot.Id)
            {
                return BadRequest();
            }

            _context.Entry(spot).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ParkingSpots.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/parking/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParkingSpot(int id)
        {
            var spot = await _context.ParkingSpots.FindAsync(id);
            if (spot == null)
            {
                return NotFound();
            }

            _context.ParkingSpots.Remove(spot);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
