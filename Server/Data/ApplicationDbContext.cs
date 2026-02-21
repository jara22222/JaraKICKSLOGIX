using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // Required for IdentityDbContext
using Microsoft.EntityFrameworkCore; // Required for DbContextOptions
using Server.Models;

namespace Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<Users>
    {
        public ApplicationDbContext(DbContextOptions dbContextOptions)
        :base(dbContextOptions)
        {
            
        }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Products> Products { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Always call the base method first for Identity tables
            base.OnModelCreating(builder);

            // Step 2: Configure the One-to-Many Relationship
            builder.Entity<Products>()
                .HasOne(p => p.User)            // Product has 1 User (Manager)
                .WithMany(u => u.Products)      // User has Many Products
                .HasForeignKey(p => p.SupplierId)   // Link them via UserId
                .OnDelete(DeleteBehavior.Cascade); // If User is deleted, delete their products (or use .Restrict to prevent deletion)
        }


    }
}