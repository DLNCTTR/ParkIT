using System.ComponentModel.DataAnnotations.Schema;

namespace ParkIT.Models
{
    public class ParkingSpot
    {
        public int Id { get; set; }
        public string Location { get; set; }
        public bool Availability { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public string Owner { get; set; }  

        public int Capacity { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
    }
}