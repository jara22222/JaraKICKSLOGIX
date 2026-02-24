using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBinLocationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BinLocation",
                columns: table => new
                {
                    BinId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    BinLocation = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BinStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BinSize = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    BinCapacity = table.Column<int>(type: "int", nullable: false),
                    QrCodeString = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BinLocation", x => x.BinId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BinLocation");
        }
    }
}
