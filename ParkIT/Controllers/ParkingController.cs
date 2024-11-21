using Microsoft.AspNetCore.Mvc;
using System;
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

        // Constructor to inject the database context
        public ParkingController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/parking
        // Fetch all parking spots from the database
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParkingSpot>>> GetParkingSpots()
        {
            try
            {
                var spots = await _context.ParkingSpots.ToListAsync();
                return Ok(spots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/parking/{id}
        // Fetch a specific parking spot by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingSpot>> GetParkingSpot(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid parking spot ID.");
            }

            var spot = await _context.ParkingSpots.FindAsync(id);

            if (spot == null)
            {
                return NotFound("Parking spot not found.");
            }

            return Ok(spot);
        }

        // POST: api/parking
        // Add a new parking spot to the database
        [HttpPost]
        public async Task<ActionResult<ParkingSpot>> PostParkingSpot([FromBody] ParkingSpot spot)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { Message = "Validation Failed", Errors = errors });
            }

            // Log the received payload for debugging
            Console.WriteLine($"Received payload: {System.Text.Json.JsonSerializer.Serialize(spot)}");

            _context.ParkingSpots.Add(spot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetParkingSpot), new { id = spot.Id }, spot);
        }

        // PUT: api/parking/{id}
        // Update an existing parking spot
        [HttpPut("{id}")]
        public async Task<IActionResult> PutParkingSpot(int id, [FromBody] ParkingSpot spot)
        {
            if (id <= 0 || id != spot.Id)
            {
                return BadRequest("Invalid ID or ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { Message = "Validation Failed", Errors = errors });
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
                    return NotFound("Parking spot not found.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/parking/{id}
        // Delete a parking spot by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParkingSpot(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid parking spot ID.");
            }

            var spot = await _context.ParkingSpots.FindAsync(id);

            if (spot == null)
            {
                return NotFound("Parking spot not found.");
            }

            _context.ParkingSpots.Remove(spot);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
