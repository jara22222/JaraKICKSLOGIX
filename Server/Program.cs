using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
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

static string NormalizeConnectionStringValue(string? rawValue)
{
    if (string.IsNullOrWhiteSpace(rawValue))
    {
        return string.Empty;
    }

    var trimmed = rawValue.Trim();
    const string prefixedKey = "ConnectionStrings__DefaultConnection=";

    if (trimmed.StartsWith(prefixedKey, StringComparison.OrdinalIgnoreCase))
    {
        return trimmed[prefixedKey.Length..].Trim();
    }

    return trimmed;
}
//Add cors services
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowSpecificOrigins", policy =>
    {
        var configuredOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()?
            .Where(static value => !string.IsNullOrWhiteSpace(value))
            .Select(static value => value.Trim().TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList()
            ?? [];

        var localDevelopmentOrigins = new[]
        {
            "http://localhost:5173",
            "https://localhost:5173",
            "http://127.0.0.1:5173",
            "https://127.0.0.1:5173"
        };

        if (builder.Environment.IsDevelopment())
        {
            configuredOrigins = configuredOrigins
                .Concat(localDevelopmentOrigins)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        policy
            .SetIsOriginAllowed(origin =>
            {
                var normalizedOrigin = origin.Trim().TrimEnd('/');
                if (configuredOrigins.Contains(normalizedOrigin, StringComparer.OrdinalIgnoreCase))
                {
                    return true;
                }

                // Supports patterns like https://*.vercel.app for preview deployments.
                return configuredOrigins.Any(configured =>
                {
                    if (!configured.Contains('*', StringComparison.Ordinal))
                    {
                        return false;
                    }

                    if (!Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
                    {
                        return false;
                    }

                    if (!Uri.TryCreate(configured.Replace("*.", string.Empty, StringComparison.Ordinal), UriKind.Absolute, out var configuredUri))
                    {
                        return false;
                    }

                    return string.Equals(originUri.Scheme, configuredUri.Scheme, StringComparison.OrdinalIgnoreCase)
                        && originUri.Host.EndsWith($".{configuredUri.Host}", StringComparison.OrdinalIgnoreCase);
                });
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

var envDefaultConnection = NormalizeConnectionStringValue(
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"));
var appSettingsFallbackConnection = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .Build()
    .GetConnectionString("DefaultConnection");

var resolvedDefaultConnection = !string.IsNullOrWhiteSpace(envDefaultConnection)
    ? envDefaultConnection
    : builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(resolvedDefaultConnection))
{
    resolvedDefaultConnection = appSettingsFallbackConnection;
}

if (string.IsNullOrWhiteSpace(resolvedDefaultConnection))
{
    throw new InvalidOperationException(
        "No SQL connection string configured. Set ConnectionStrings__DefaultConnection or appsettings.json ConnectionStrings:DefaultConnection.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(resolvedDefaultConnection));

builder.Services.AddIdentity<Users, IdentityRole>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 12; // Fixed typo
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
{
    options.TokenLifespan = TimeSpan.FromMinutes(30);
});

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
builder.Services
    .AddDataProtection()
    .SetApplicationName("KicksLogix")
    .PersistKeysToDbContext<ApplicationDbContext>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IEmailSenderService, EmailSenderService>();
builder.Services.AddControllers();
builder.Services.AddSignalR();
var app = builder.Build();

var resendApiKeyFromConfig = builder.Configuration["Email:ApiKey"];
var resendApiKeyFromProcess = Environment.GetEnvironmentVariable("KICKSLOGIX_EMAIL_API_KEY", EnvironmentVariableTarget.Process);
var resendApiKeyFromUser = Environment.GetEnvironmentVariable("KICKSLOGIX_EMAIL_API_KEY", EnvironmentVariableTarget.User);
var resendApiKeyFromMachine = Environment.GetEnvironmentVariable("KICKSLOGIX_EMAIL_API_KEY", EnvironmentVariableTarget.Machine);
var resendApiKeySource =
    !string.IsNullOrWhiteSpace(resendApiKeyFromConfig) ? "config:Email:ApiKey" :
    !string.IsNullOrWhiteSpace(resendApiKeyFromProcess) ? "env:Process" :
    !string.IsNullOrWhiteSpace(resendApiKeyFromUser) ? "env:User" :
    !string.IsNullOrWhiteSpace(resendApiKeyFromMachine) ? "env:Machine" :
    "not-configured";

if (resendApiKeySource == "not-configured")
{
    app.Logger.LogWarning("Email provider startup check: Resend API key is NOT configured.");
}
else
{
    app.Logger.LogInformation("Email provider startup check: Resend API key is configured via {Source}.", resendApiKeySource);
}


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
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[dbo].[DataProtectionKeys]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[DataProtectionKeys](
                    [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_DataProtectionKeys] PRIMARY KEY,
                    [FriendlyName] NVARCHAR(MAX) NULL,
                    [Xml] NVARCHAR(MAX) NULL
                );
            END
            """);
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