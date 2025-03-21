using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using ParkIT.Data;
using NetTopologySuite;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load Configuration from appsettings.json
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                     .AddEnvironmentVariables();

// ✅ Validate JWT Configuration
var issuer = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];
var key = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience) || string.IsNullOrEmpty(key))
{
    throw new InvalidOperationException("ERROR: Missing JWT configuration in appsettings.json.");
}

Console.WriteLine($"Jwt:Issuer -> {issuer}");
Console.WriteLine($"Jwt:Audience -> {audience}");
Console.WriteLine("Jwt:Key -> Loaded Successfully");

// ✅ Configure Controllers & JSON Serialization
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore; // ✅ Prevent self-referencing loops
    });

// ✅ Configure Database with NetTopologySuite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.UseNetTopologySuite()
    ));

// ✅ Configure Authentication (JWT)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
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
            ClockSkew = TimeSpan.Zero // ✅ Prevents token expiration delay
        };
    });

builder.Services.AddAuthorization();

// ✅ Configure Swagger (Available in ALL Environments)
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

// ✅ Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", corsBuilder =>
        corsBuilder
            .WithOrigins(builder.Configuration["AllowedCorsOrigins"]?.Split(",") ?? new[] { "http://localhost:3000" })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// ✅ Global Error Handling Middleware
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("{ \"error\": \"An unexpected error occurred. Please try again later.\" }");
    });
});

// ✅ Enable Swagger (Always Available)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ParkIT API v1");
    c.RoutePrefix = "swagger"; // ✅ Visit http://localhost:5000/swagger
});

// ✅ Middleware Order Matters
app.UseHttpsRedirection();
app.UseCors("AllowReactApp"); // 🔹 Apply CORS before Authentication
app.UseAuthentication();
app.UseAuthorization();

// ✅ Ensure API Controllers are Mapped
app.MapControllers();

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        context.Response.Redirect("/home", permanent: false);
        return;
    }
    await next();
});

app.Run();
