using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ParkIT.Data;
using ParkIT.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ParkIT.DTOs;

namespace ParkIT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ✅ LOGIN Endpoint (With Logging)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { Message = "Invalid input" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || user.Password != loginDto.Password) // ❌ No Hashing (For Development Only)
            {
                Console.WriteLine($"❌ [LOGIN FAILED] Invalid credentials for user: {loginDto.Username}");
                return Unauthorized(new { Message = "Invalid username or password" });
            }

            var token = GenerateJwtToken(user);

            Console.WriteLine($"✅ [LOGIN SUCCESS] User: {user.Username} (ID: {user.Id}) logged in successfully.");

            return Ok(new
            {
                Token = token,
                User = new { user.Id, user.Username, user.Email, user.Role }
            });
        }

        // ✅ REGISTER Endpoint (Without `CreatedAt`)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { Message = "Invalid input" });

            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                return Conflict(new { Message = "Username is already taken" });

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return Conflict(new { Message = "Email is already registered" });

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = registerDto.Password, // ❌ No Hashing (For Development Only)
                Role = "User"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ [USER REGISTERED] New user: {user.Username} (ID: {user.Id}) registered successfully.");

            return Ok(new { Message = "User registered successfully" });
        }

        // ✅ GET USER ROLE Endpoint
        [HttpGet("user-role")]
        [Authorize] // Requires authentication
        public async Task<IActionResult> GetUserRole()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User not authenticated.");

            if (!int.TryParse(userIdClaim.Value, out int userId))
                return BadRequest("Invalid user ID.");

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new { Role = u.Role })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found.");

            if (string.IsNullOrEmpty(user.Role))
                return BadRequest("User role is missing or invalid.");

            return Ok(new { role = user.Role });
        }

        // ✅ JWT TOKEN GENERATION
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _configuration["Jwt:Key"];

            if (string.IsNullOrEmpty(keyString))
            {
                Console.WriteLine("❌ ERROR: JWT Key is missing! Check appsettings.json or environment variables.");
                throw new InvalidOperationException("JWT Key is missing!");
            }

            var key = Encoding.ASCII.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role ?? "User") // ✅ Prevents null exception
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"], // ✅ Fix for "The audience 'empty' is invalid"
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
