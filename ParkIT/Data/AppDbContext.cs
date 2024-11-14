using Microsoft.EntityFrameworkCore;
using ParkIT.Models;

namespace ParkIT.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }          // Ensure this line is present and correct
        public DbSet<ParkingSpot> ParkingSpots { get; set; }
    }
}