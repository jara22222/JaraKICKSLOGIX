using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class RenameProductsToInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_AspNetUsers_SupplierId",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Inventory");

            migrationBuilder.RenameIndex(
                name: "IX_Products_SupplierId",
                table: "Inventory",
                newName: "IX_Inventory_SupplierId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Inventory",
                table: "Inventory",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_AspNetUsers_SupplierId",
                table: "Inventory",
                column: "SupplierId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_AspNetUsers_SupplierId",
                table: "Inventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Inventory",
                table: "Inventory");

            migrationBuilder.RenameTable(
                name: "Inventory",
                newName: "Products");

            migrationBuilder.RenameIndex(
                name: "IX_Inventory_SupplierId",
                table: "Products",
                newName: "IX_Products_SupplierId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_AspNetUsers_SupplierId",
                table: "Products",
                column: "SupplierId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
