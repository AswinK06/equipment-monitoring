using System.Text.Json.Serialization;
using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Hubs;
using EquipmentMonitoring.Api.Middleware;
using EquipmentMonitoring.Api.Mqtt;
using EquipmentMonitoring.Api.Services;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(cfg.GetConnectionString("Default")));
builder.Services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddSignalR().AddJsonProtocol(o => o.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IEquipmentService, EquipmentService>();
builder.Services.AddScoped<IReadingService, ReadingService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddSingleton<IRealtimeNotifier, SignalRNotifier>();

builder.Services.Configure<MqttOptions>(cfg.GetSection("Mqtt"));
builder.Services.AddHostedService<MqttSubscriberService>();

var origins = cfg.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .SetIsOriginAllowed(_ => true)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await DbSeeder.InitAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>());
}

app.UseExceptionHandler();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.MapHub<EquipmentHub>("/hubs/equipment");
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.Run();
