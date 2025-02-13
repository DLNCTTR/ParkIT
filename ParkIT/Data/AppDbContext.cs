using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using ParkIT.Models;

namespace ParkIT.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ✅ Define Database Tables
        public DbSet<User> Users { get; set; }          
        public DbSet<ParkingSpot> ParkingSpots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            // ✅ Configure `GeoLocation` as a SQL Server `geography` type
            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.GeoLocation)
                .HasColumnType("geography")  // ✅ Store as `geography`
                .HasColumnName("GeoLocation")
                .HasDefaultValue(null);

            // ✅ Ensure Decimal Precision for `PricePerHour`
            modelBuilder.Entity<ParkingSpot>()
                .Property(p => p.PricePerHour)
                .HasPrecision(18, 2); // ✅ Allows large values with two decimal places

            // ✅ Ensure Foreign Key Relationship: User (1) → (M) ParkingSpots
            modelBuilder.Entity<ParkingSpot>()
                .HasOne(p => p.User)
                .WithMany(u => u.ParkingSpots) // ✅ User must have this property in its model
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade); // ✅ Deleting a User deletes their ParkingSpots

            // ✅ Ensure Unique Constraints for `User` Table
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
