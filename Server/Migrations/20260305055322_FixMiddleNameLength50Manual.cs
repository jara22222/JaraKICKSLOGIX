using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class FixMiddleNameLength50Manual : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'AspNetUsers'
      AND COLUMN_NAME = 'MiddleName'
      AND CHARACTER_MAXIMUM_LENGTH = 1
)
BEGIN
    ALTER TABLE [AspNetUsers] ALTER COLUMN [MiddleName] nvarchar(50) NOT NULL;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'AspNetUsers'
      AND COLUMN_NAME = 'MiddleName'
      AND CHARACTER_MAXIMUM_LENGTH = 50
)
BEGIN
    ALTER TABLE [AspNetUsers] ALTER COLUMN [MiddleName] nvarchar(1) NOT NULL;
END
");
        }
    }
}
