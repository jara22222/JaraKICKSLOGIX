using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnershipAndProductRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_AspNetUsers_SupplierId",
                table: "Inventory");

            // Normalize legacy/orphan FK values before adding constraints.
            migrationBuilder.Sql(
                @"
                UPDATE sm
                SET sm.ProductId = LTRIM(RTRIM(sm.ProductId))
                FROM StockMovements sm
                WHERE sm.ProductId IS NOT NULL
                  AND sm.ProductId <> LTRIM(RTRIM(sm.ProductId));

                UPDATE sm
                SET sm.ProductId = NULL
                FROM StockMovements sm
                LEFT JOIN Inventory i ON i.ProductId = sm.ProductId
                WHERE sm.ProductId IS NOT NULL
                  AND (LTRIM(RTRIM(sm.ProductId)) = '' OR i.ProductId IS NULL);

                UPDATE sm
                SET sm.OrderId = LTRIM(RTRIM(sm.OrderId))
                FROM StockMovements sm
                WHERE sm.OrderId IS NOT NULL
                  AND sm.OrderId <> LTRIM(RTRIM(sm.OrderId));

                UPDATE sm
                SET sm.OrderId = NULL
                FROM StockMovements sm
                LEFT JOIN Orders o ON o.OrderId = sm.OrderId
                WHERE sm.OrderId IS NOT NULL
                  AND (LTRIM(RTRIM(sm.OrderId)) = '' OR o.OrderId IS NULL);

                UPDATE sm
                SET sm.BinId = LTRIM(RTRIM(sm.BinId))
                FROM StockMovements sm
                WHERE sm.BinId IS NOT NULL
                  AND sm.BinId <> LTRIM(RTRIM(sm.BinId));

                UPDATE sm
                SET sm.BinId = NULL
                FROM StockMovements sm
                LEFT JOIN BinLocation b ON b.BinId = sm.BinId
                WHERE sm.BinId IS NOT NULL
                  AND (LTRIM(RTRIM(sm.BinId)) = '' OR b.BinId IS NULL);

                UPDATE o
                SET o.ApprovedByUserId = LTRIM(RTRIM(o.ApprovedByUserId))
                FROM Orders o
                WHERE o.ApprovedByUserId IS NOT NULL
                  AND o.ApprovedByUserId <> LTRIM(RTRIM(o.ApprovedByUserId));

                UPDATE o
                SET o.ApprovedByUserId = NULL
                FROM Orders o
                LEFT JOIN AspNetUsers u ON u.Id = o.ApprovedByUserId
                WHERE o.ApprovedByUserId IS NOT NULL
                  AND (LTRIM(RTRIM(o.ApprovedByUserId)) = '' OR u.Id IS NULL);

                UPDATE i
                SET i.BinId = LTRIM(RTRIM(i.BinId))
                FROM Inventory i
                WHERE i.BinId IS NOT NULL
                  AND i.BinId <> LTRIM(RTRIM(i.BinId));

                UPDATE i
                SET i.BinId = NULL
                FROM Inventory i
                LEFT JOIN BinLocation b ON b.BinId = i.BinId
                WHERE i.BinId IS NOT NULL
                  AND (LTRIM(RTRIM(i.BinId)) = '' OR b.BinId IS NULL);

                UPDATE i
                SET i.SupplierId = LTRIM(RTRIM(i.SupplierId))
                FROM Inventory i
                WHERE i.SupplierId IS NOT NULL
                  AND i.SupplierId <> LTRIM(RTRIM(i.SupplierId));

                UPDATE i
                SET i.SupplierId = fallback.Id
                FROM Inventory i
                CROSS APPLY (SELECT TOP (1) u.Id FROM AspNetUsers u ORDER BY u.Id) fallback
                WHERE i.SupplierId IS NULL OR i.SupplierId = '' OR NOT EXISTS (
                    SELECT 1 FROM AspNetUsers u WHERE u.Id = i.SupplierId
                );
                ");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_BinId",
                table: "StockMovements",
                column: "BinId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_OrderId",
                table: "StockMovements",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ProductId",
                table: "StockMovements",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ApprovedByUserId",
                table: "Orders",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_BinId",
                table: "Inventory",
                column: "BinId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_AspNetUsers_SupplierId",
                table: "Inventory",
                column: "SupplierId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_BinLocation_BinId",
                table: "Inventory",
                column: "BinId",
                principalTable: "BinLocation",
                principalColumn: "BinId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_ApprovedByUserId",
                table: "Orders",
                column: "ApprovedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_BinLocation_BinId",
                table: "StockMovements",
                column: "BinId",
                principalTable: "BinLocation",
                principalColumn: "BinId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Inventory_ProductId",
                table: "StockMovements",
                column: "ProductId",
                principalTable: "Inventory",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Orders_OrderId",
                table: "StockMovements",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_AspNetUsers_SupplierId",
                table: "Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_BinLocation_BinId",
                table: "Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_ApprovedByUserId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_BinLocation_BinId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Inventory_ProductId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Orders_OrderId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_BinId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_OrderId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_ProductId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ApprovedByUserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_BinId",
                table: "Inventory");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_AspNetUsers_SupplierId",
                table: "Inventory",
                column: "SupplierId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
