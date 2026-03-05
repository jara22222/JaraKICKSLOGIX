using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBranchPasswordResetRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BranchPasswordResetRequests",
                columns: table => new
                {
                    RequestId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Branch = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserFirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserLastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequestedByFirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequestedByLastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequestedByEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RequestedByAddress = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    RequestedRoleName = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResetLinkSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResetCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ReviewedByUserName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReviewRemarks = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BranchPasswordResetRequests", x => x.RequestId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BranchPasswordResetRequests_Branch_Status_RequestedAt",
                table: "BranchPasswordResetRequests",
                columns: new[] { "Branch", "Status", "RequestedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BranchPasswordResetRequests_UserId_Status",
                table: "BranchPasswordResetRequests",
                columns: new[] { "UserId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BranchPasswordResetRequests");
        }
    }
}
