using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ParkIT.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load configuration
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                     .AddEnvironmentVariables();

// ✅ Load JWT settings
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];
var key = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience) || string.IsNullOrEmpty(key))
{
    throw new InvalidOperationException("❌ ERROR: Missing JWT configuration in appsettings.json.");
}

Console.WriteLine($"[DEBUG] Jwt:Issuer -> {issuer}");
Console.WriteLine($"[DEBUG] Jwt:Audience -> {audience}");
Console.WriteLine($"[DEBUG] Jwt:Key -> ✅ Loaded Successfully");

// ==========================
// ✅ Configure Services
// ==========================

builder.Services.AddControllers();

// ✅ Configure Entity Framework with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Add JWT Authentication with proper validation
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment(); // ✅ Only enforce HTTPS in production
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.Zero // ✅ Prevents expiration delays
        };
    });

builder.Services.AddAuthorization();

// ✅ Add Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ParkIT API",
        Version = "v1",
        Description = "API for managing parking spots in the ParkIT system"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter 'Bearer {your JWT token}'",
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

// ✅ CORS Fix: Load from `appsettings.json`
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", corsBuilder =>
        corsBuilder
            .WithOrigins(builder.Configuration["AllowedCorsOrigins"]?.Split(",") ?? new[] { "http://localhost:3000" })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// ==========================
// ✅ Build the Application
// ==========================
var app = builder.Build();

// ✅ Global Exception Handling Middleware (Fix: Return JSON)
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("{ \"error\": \"An unexpected error occurred. Please try again later.\" }");
    });
});

// ✅ Enable Swagger UI only in Development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ParkIT API v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// ✅ Enforce HTTPS Redirection
app.UseHttpsRedirection();

// ✅ Enable CORS
app.UseCors("AllowReactApp");

// ✅ Enable Authentication & Authorization Middleware
app.UseAuthentication();
app.UseAuthorization();

// ✅ Map API controllers
app.MapControllers();

// ✅ Start the application
app.Run();
