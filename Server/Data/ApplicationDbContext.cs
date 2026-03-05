using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // Required for IdentityDbContext
using Microsoft.EntityFrameworkCore; // Required for DbContextOptions
using Server.Models;

namespace Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<Users>
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> dbContextOptions,
            IHttpContextAccessor? httpContextAccessor = null)
        :base(dbContextOptions)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<BinLocation> BinLocations { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<BranchNotification> BranchNotifications { get; set; }
        public DbSet<BranchPasswordResetRequest> BranchPasswordResetRequests { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Always call the base method first for Identity tables
            base.OnModelCreating(builder);

            // Branch isolation: non-super-admin users only read records from their own branch.
            builder.Entity<Order>()
                .HasQueryFilter(order => !ShouldApplyBranchFilter() || order.Branch == GetCurrentBranch());
            builder.Entity<StockMovement>()
                .HasQueryFilter(movement => !ShouldApplyBranchFilter() || movement.Branch == GetCurrentBranch());
            builder.Entity<AuditLog>()
                .HasQueryFilter(log => !ShouldApplyBranchFilter() || log.Branch == GetCurrentBranch());
            builder.Entity<BranchNotification>()
                .HasQueryFilter(notification => !ShouldApplyBranchFilter() || notification.Branch == GetCurrentBranch());
            builder.Entity<BinLocation>()
                .HasQueryFilter(bin => !ShouldApplyBranchFilter() || bin.Branch == GetCurrentBranch());
            builder.Entity<Inventory>()
                .HasQueryFilter(item => !ShouldApplyBranchFilter() || item.User.Branch == GetCurrentBranch());

            // Step 2: Configure the One-to-Many Relationship
            builder.Entity<Inventory>()
                .HasOne(p => p.User)            // Product has 1 User (Manager)
                .WithMany(u => u.InventoryItems)      // User has Many Inventory items
                .HasForeignKey(p => p.SupplierId)   // Link them via UserId
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Inventory>()
                .HasOne(item => item.BinLocation)
                .WithMany(bin => bin.InventoryItems)
                .HasForeignKey(item => item.BinId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Order>()
                .HasOne(order => order.ApprovedByUser)
                .WithMany(user => user.ApprovedOrders)
                .HasForeignKey(order => order.ApprovedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<StockMovement>()
                .HasOne(movement => movement.Product)
                .WithMany()
                .HasForeignKey(movement => movement.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<StockMovement>()
                .HasOne(movement => movement.Order)
                .WithMany(order => order.StockMovements)
                .HasForeignKey(movement => movement.OrderId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<StockMovement>()
                .HasOne(movement => movement.BinLocation)
                .WithMany(bin => bin.StockMovements)
                .HasForeignKey(movement => movement.BinId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<BinLocation>()
                .HasKey(bin => bin.BinId);

            builder.Entity<Order>()
                .HasIndex(order => new { order.Branch, order.Status, order.CreatedAt });

            builder.Entity<StockMovement>()
                .HasIndex(movement => new { movement.Branch, movement.Action, movement.OccurredAt });
            builder.Entity<StockMovement>()
                .HasIndex(movement => movement.ProductId);
            builder.Entity<StockMovement>()
                .HasIndex(movement => movement.OrderId);
            builder.Entity<StockMovement>()
                .HasIndex(movement => movement.BinId);

            builder.Entity<BranchNotification>()
                .HasIndex(notification => new { notification.Branch, notification.IsRead, notification.CreatedAt });

            builder.Entity<BranchPasswordResetRequest>()
                .HasIndex(request => new { request.Branch, request.Status, request.RequestedAt });

            builder.Entity<BranchPasswordResetRequest>()
                .HasIndex(request => new { request.UserId, request.Status });

            builder.Entity<BinLocation>()
                .HasIndex(bin => new { bin.Branch, bin.BinStatus, bin.CreatedAt });
            builder.Entity<Inventory>()
                .HasIndex(item => item.BinId);
            builder.Entity<Order>()
                .HasIndex(order => order.ApprovedByUserId);
        }

        private string GetCurrentBranch()
        {
            var user = _httpContextAccessor?.HttpContext?.User;
            if (user == null)
            {
                return string.Empty;
            }

            return user.FindFirstValue("Branch")
                ?? user.FindFirstValue("branch")
                ?? string.Empty;
        }

        private bool ShouldApplyBranchFilter()
        {
            var user = _httpContextAccessor?.HttpContext?.User;
            if (user == null || user.Identity?.IsAuthenticated != true)
            {
                return false;
            }

            if (user.IsInRole("SuperAdmin"))
            {
                return false;
            }

            return true;
        }

    }
}