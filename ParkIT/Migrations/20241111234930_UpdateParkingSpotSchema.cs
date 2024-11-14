using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkIT.Migrations
{
    public partial class UpdateParkingSpotSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "ParkingSpots");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "ParkingSpots",
                newName: "PricePerHour");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "ParkingSpots",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Owner",
                table: "ParkingSpots",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "ParkingSpots",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ParkingSpots",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "ParkingSpots");

            migrationBuilder.RenameColumn(
                name: "PricePerHour",
                table: "ParkingSpots",
                newName: "Price");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "ParkingSpots",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Owner",
                table: "ParkingSpots",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "ParkingSpots",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ParkingSpots",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
