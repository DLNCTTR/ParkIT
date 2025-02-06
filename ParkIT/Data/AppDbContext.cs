using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO; // ✅ Required for WKTReader
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
            var wktReader = new WKTReader(geometryFactory);

            // ✅ Ensure GeoLocation is stored as a SQL Server 'geography' type
            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.GeoLocation)
                .HasColumnType("geography") // ✅ Explicitly set as geography type
                .HasConversion(
                    v => v == null ? null : v.AsText(), // ✅ Convert Point to WKT string before saving
                    v => v == null ? null : (Point) wktReader.Read(v) // ✅ Convert WKT string back to Point
                );

            // ✅ Fix Decimal Precision Issue for PricePerHour
            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.PricePerHour)
                .HasPrecision(18, 2); // ✅ Ensures proper decimal precision (e.g., 999999999999.99)

            // ✅ Ensure Unique Constraints for User Table
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
                optionsBuilder.UseSqlServer("YourDatabaseConnectionString",
                    x => x.UseNetTopologySuite()); // ✅ Enables spatial support
            }
        }
    }
}
