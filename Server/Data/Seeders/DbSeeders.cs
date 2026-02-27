using Microsoft.AspNetCore.Identity;
using Server.Models;

namespace Server.Data.Seeders
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<Users>>();

            // 1. Seed Roles
            string[] roles =
            {
                "SuperAdmin",
                "BranchManager",
                "Receiver",
                "PutAway",
                "DispatchClerk",
                "VASPersonnel",
                "Supplier"
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. Seed Super Admin
            var superAdminEmail = "superadmin@kickslogix.com";
            if (await userManager.FindByEmailAsync(superAdminEmail) == null)
            {
                var superAdmin = new Users
                {
                    UserName = "SuperAdmin",
                    Email = superAdminEmail,
                    FirstName = "Super",
                    LastName = "Admin",
                    IsActive = "Active",
                    Address = "Main HQ",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(superAdmin, "SuperAdmin@2026");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(superAdmin, "SuperAdmin");
                }
            }
        }
    }
}