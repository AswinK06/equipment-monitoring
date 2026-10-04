using System.Text.Json.Serialization;
using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Extensions;
using EquipmentMonitoring.Api.Hubs;
using EquipmentMonitoring.Api.Middleware;
using EquipmentMonitoring.Api.Mqtt;
using EquipmentMonitoring.Api.Services;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

var jwtKey = cfg["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key is missing or shorter than 32 characters. Configure a secure key in appsettings.json or environment variables."
    );
}

builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(cfg.GetConnectionString("Default")));

builder.Services.AddControllers().AddJsonOptions(o =>
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter())
);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddSignalR().AddJsonProtocol(o =>
    o.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter())
);

builder.Services.AddJwtAuthentication(cfg);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddAppCache(cfg);
builder.Services.AddAuthRateLimiting();

builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IEquipmentService, EquipmentService>();
builder.Services.AddScoped<IReadingService, ReadingService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IRealtimeNotifier, SignalRNotifier>();

builder.Services.Configure<MqttOptions>(cfg.GetSection("Mqtt"));
builder.Services.AddHostedService<MqttSubscriberService>();

var origins = cfg.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:3000", "http://localhost:5173"];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(origins)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

if (string.IsNullOrWhiteSpace(cfg["Redis:ConnectionString"]))
{
    app.Logger.LogInformation("Redis not configured, using in-memory cache");
}

using (var scope = app.Services.CreateScope())
{
    await DbSeeder.InitAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>(), app.Configuration);
}

app.UseExceptionHandler();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<EquipmentHub>("/hubs/equipment");
app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();

app.Run();
