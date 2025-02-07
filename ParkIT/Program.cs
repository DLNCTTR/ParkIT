using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ParkIT.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==========================
// ✅ Configure Services
// ==========================

// Add controllers for API endpoints
builder.Services.AddControllers();

// ✅ Configure Entity Framework with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// ✅ Add Authorization
builder.Services.AddAuthorization();

// ✅ Add Swagger for API documentation with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ParkIT API",
        Version = "v1",
        Description = "API for managing parking spots in the ParkIT system"
    });

    // ✅ Enable JWT Authorization in Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer YOUR_TOKEN')",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// ✅ Configure CORS policy to allow requests from React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", corsBuilder =>
        corsBuilder.WithOrigins("http://localhost:3000") // Allow requests only from React frontend
                   .AllowAnyMethod() // Allow all HTTP methods (GET, POST, PUT, DELETE)
                   .AllowAnyHeader() // Allow all headers
                   .AllowCredentials()); // Allow cookies for authentication (if required)
});

// ==========================
// ✅ Build the Application
// ==========================
var app = builder.Build();

// ==========================
// ✅ Configure Middleware Pipeline
// ==========================

// ✅ Environment-specific middleware
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
    // ✅ Production environment middleware
    app.UseExceptionHandler("/Home/Error"); // Handle exceptions globally
    app.UseHsts();                          // Enforce HTTPS
}

// ✅ Enforce HTTPS for all requests
app.UseHttpsRedirection();

// ✅ Serve static files (e.g., React build files)
app.UseStaticFiles();

// ✅ Enable routing
app.UseRouting();

// ✅ Enable CORS policy for React frontend
app.UseCors("AllowReactApp");

// ✅ Add Authentication & Authorization Middleware
app.UseAuthentication();
app.UseAuthorization();

// ✅ Map API controllers to routes (e.g., /api/[controller])
app.MapControllers();

// ✅ Fallback to React `index.html` for unknown routes
app.MapFallbackToFile("index.html");

// ✅ Start the application
app.Run();
