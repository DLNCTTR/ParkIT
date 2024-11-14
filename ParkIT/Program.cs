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

// Register controllers to enable API routing with controller classes
builder.Services.AddControllers();

// Register database context (AppDbContext) with SQL Server using connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Swagger for API documentation
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ParkIT API",  // Title of your API documentation
        Version = "v1",        // API version
        Description = "API for managing parking spots in ParkIT system"
    });
});

// Optional CORS Policy (Uncomment if needed for frontend access)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// ==========================
// Build Application
// ==========================

var app = builder.Build();

// ==========================
// Configure Middleware Pipeline
// ==========================

// Middleware to use in development environment
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();  // Provides detailed error pages
    app.UseSwagger();                 // Enables Swagger JSON generation for API
    app.UseSwaggerUI(c =>             // Sets up interactive UI at /swagger endpoint
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ParkIT API v1");
    });
}
else
{
    app.UseExceptionHandler("/Home/Error"); // Global error handler in production
    app.UseHsts();                          // Enforces strict HTTPS in production
}

// Enforce HTTPS for all requests
app.UseHttpsRedirection();

// Serve static files like HTML, CSS, JS (if any) from wwwroot folder
app.UseStaticFiles();

// Enable routing in the app
app.UseRouting();

// Enable CORS policy if added above (optional)
app.UseCors("AllowAllOrigins");

// Enable authorization middleware (checks access permissions)
app.UseAuthorization();

// Map API controllers with attribute routing (e.g., [Route("api/[controller]")])
app.MapControllers();

app.Run();
