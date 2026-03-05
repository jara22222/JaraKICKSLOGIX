using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryBranchIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Branch",
                table: "Inventory",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "UNASSIGNED");

            migrationBuilder.Sql(
                @"
UPDATE inv
SET inv.Branch = COALESCE(latest.Branch, usr.Branch, 'UNASSIGNED')
FROM Inventory inv
OUTER APPLY (
    SELECT TOP 1 sm.Branch
    FROM StockMovements sm
    WHERE sm.ProductId = inv.ProductId
      AND sm.Branch IS NOT NULL
      AND LTRIM(RTRIM(sm.Branch)) <> ''
    ORDER BY sm.OccurredAt DESC
) latest
LEFT JOIN AspNetUsers usr ON usr.Id = inv.SupplierId
WHERE inv.Branch IS NULL OR LTRIM(RTRIM(inv.Branch)) = '';
");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_Branch",
                table: "Inventory",
                column: "Branch");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Inventory_Branch",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "Branch",
                table: "Inventory");
        }
    }
}
