using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Data; 
using Server.Models; 
using Server.Data.Seeders;
using Server.Services;
using Server.Hubs;
using Server.Hubs.BranchManagerHub;
using Scalar.AspNetCore;


var builder = WebApplication.CreateBuilder(args);
//Add cors services
builder.Services.AddCors(options => 
{
    options.AddPolicy("MyAllowSpecificOrigins",
    policy=>{
        var allowedOrigins = new[]
        {
            "http://localhost:5173",
            "https://jara-kickslogix.vercel.app",
            "http://192.168.56.1:5173",
            "http://192.168.254.131:5173"
        };

        policy
            .SetIsOriginAllowed((origin) =>
            {
                var normalized = origin.TrimEnd('/');
                return allowedOrigins.Any((allowed) =>
                    string.Equals(
                        allowed.TrimEnd('/'),
                        normalized,
                        StringComparison.OrdinalIgnoreCase
                    )
                );
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

var connectionString = builder.Environment.IsDevelopment() 
    ? builder.Configuration.GetConnectionString("DefaultConnection") // LocalDB
    : Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
      ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"); // Render-friendly fallback

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is missing. Set DefaultConnection (development) or DB_CONNECTION_STRING (production)."
    );
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentity<Users, IdentityRole>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 12; // Fixed typo
})
.AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme; // Fixed typos
    options.DefaultForbidScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"], // Fixed trailing space in key
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidateIssuerSigningKey = true, // Set to boolean
        IssuerSigningKey = new SymmetricSecurityKey( // Assigned actual key here with capital 'K'
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]!) // Added dot
        )
    };
});




builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers();
builder.Services.AddSignalR();
var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // The beautiful new UI!
}

using (var scope = app.Services.CreateScope())
{
    try
    {
        await DbSeeder.SeedAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Seeder error: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
    }
}
app.UseRouting();
app.UseCors("MyAllowSpecificOrigins");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");
app.MapHub<SupplierHub>("/supplierHub");
app.MapHub<ManagerHub>("/managerHub");
app.MapHub<UpdateManagerHub>("/update-managerHub");
app.MapHub<ArchiveUserHub>("/archive-managerHub");
app.MapHub<GetAllManagerHub>("/getAll-managerHub");
app.MapHub<SearchManagerHub>("/search-managerHub");
app.MapHub<BranchAccountHub>("/branchAccount-managerHub");
app.MapHub<BranchNotificationHub>("/branch-notificationHub");
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}