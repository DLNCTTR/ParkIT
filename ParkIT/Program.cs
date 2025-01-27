using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ParkIT.Data;

var builder = WebApplication.CreateBuilder(args);

// ==========================
// Configure Services
// ==========================

// Add controllers for API endpoints
builder.Services.AddControllers();

// Configure Entity Framework with SQL Server and connection string
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Swagger for API documentation
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ParkIT API",
        Version = "v1",
        Description = "API for managing parking spots in the ParkIT system"
    });
});

// Add CORS policy to allow requests from the React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", corsBuilder =>
        corsBuilder.WithOrigins("http://localhost:3000") // Allow requests only from the React app
                   .AllowAnyMethod()                    // Allow all HTTP methods (GET, POST, PUT, DELETE)
                   .AllowAnyHeader()                    // Allow all headers
                   .AllowCredentials());                // Allow cookies for authentication (if required)
});

// ==========================
// Build the Application
// ==========================
var app = builder.Build();

// ==========================
// Configure Middleware Pipeline
// ==========================

// Environment-specific middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Show detailed error pages
    app.UseSwagger();                // Enable Swagger for API documentation
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ParkIT API v1");
        c.RoutePrefix = "swagger";  // Swagger UI will be accessible at /swagger
    });
}
else
{
    // Production environment middleware
    app.UseExceptionHandler("/Home/Error"); // Handle exceptions globally
    app.UseHsts();                          // Enforce HTTPS
}

// Enforce HTTPS for all requests
app.UseHttpsRedirection();

// Serve static files (e.g., React build files)
app.UseStaticFiles();

// Enable routing
app.UseRouting();

// Enable CORS policy for React app
app.UseCors("AllowReactApp");

// Add authorization middleware
app.UseAuthorization();

// Map API controllers to routes (e.g., /api/[controller])
app.MapControllers();

// Fallback to React index.html for unknown routes
app.MapFallbackToFile("index.html");

// Start the application
app.Run();
