using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using ParkIT.Models;

namespace ParkIT.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }          
        public DbSet<ParkingSpot> ParkingSpots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.GeoLocation)
                .HasColumnType("geography") 
                .HasDefaultValueSql("geography::Point(0, 0, 4326)"); // ✅ Default to (0,0)

            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.FormattedAddress)
                .HasColumnType("NVARCHAR(300)"); // ✅ Ensure column exists

            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.PricePerHour)
                .HasPrecision(18, 2); 

            modelBuilder.Entity<ParkingSpot>()
                .HasOne(p => p.User)
                .WithMany(u => u.ParkingSpots)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(
                    "Server=localhost\\SQLEXPRESS;Database=ParkITDb;Trusted_Connection=True;MultipleActiveResultSets=true", 
                    x => x.UseNetTopologySuite() // ✅ Enables spatial support
                );
            }
        }
    }
}
