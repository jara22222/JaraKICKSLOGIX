using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBranchToBinLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Branch",
                table: "BinLocation",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
UPDATE bin
SET bin.[Branch] = users.[Branch]
FROM [BinLocation] AS bin
OUTER APPLY (
    SELECT TOP (1) inv.[SupplierId]
    FROM [Inventory] AS inv
    WHERE inv.[BinId] = bin.[BinId]
    ORDER BY ISNULL(inv.[UpdatedAt], inv.[DateReceived]) DESC
) AS latest
LEFT JOIN [AspNetUsers] AS users ON users.[Id] = latest.[SupplierId]
WHERE (bin.[Branch] IS NULL OR bin.[Branch] = '')
  AND users.[Branch] IS NOT NULL
  AND users.[Branch] <> '';
");

            migrationBuilder.Sql(@"
UPDATE bin
SET bin.[Branch] = logs.[Branch]
FROM [BinLocation] AS bin
OUTER APPLY (
    SELECT TOP (1) log.[Branch]
    FROM [AuditLogs] AS log
    WHERE log.[Branch] IS NOT NULL
      AND log.[Branch] <> ''
      AND (
        log.[Description] LIKE '%bin location: ' + bin.[BinLocation] + '%'
        OR log.[Description] LIKE '%' + bin.[BinLocation] + '%'
      )
    ORDER BY log.[DatePerformed] DESC
) AS logs
WHERE (bin.[Branch] IS NULL OR bin.[Branch] = '')
  AND logs.[Branch] IS NOT NULL
  AND logs.[Branch] <> '';
");

            migrationBuilder.Sql(@"
UPDATE [BinLocation]
SET [Branch] = 'UNASSIGNED'
WHERE [Branch] IS NULL OR [Branch] = '';
");

            migrationBuilder.CreateIndex(
                name: "IX_BinLocation_Branch_BinStatus_CreatedAt",
                table: "BinLocation",
                columns: new[] { "Branch", "BinStatus", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BinLocation_Branch_BinStatus_CreatedAt",
                table: "BinLocation");

            migrationBuilder.DropColumn(
                name: "Branch",
                table: "BinLocation");
        }
    }
}
