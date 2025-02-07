using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ParkIT.Data;
using ParkIT.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            if (!ModelState.IsValid) return BadRequest(new { Message = "Invalid input" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || user.Password != loginDto.Password)
                return Unauthorized(new { Message = "Invalid username or password" });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                User = new { user.Id, user.Username, user.Email, user.Role }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
        {
            if (!ModelState.IsValid) return BadRequest(new { Message = "Invalid input" });

            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                return Conflict(new { Message = "Username is already taken" });

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return Conflict(new { Message = "Email is already registered" });

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = registerDto.Password, // ❌ Plain text for development
                Role = "User" // ✅ Default role assigned
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User registered successfully" });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
