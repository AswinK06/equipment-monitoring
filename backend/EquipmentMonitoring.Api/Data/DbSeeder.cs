using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EquipmentMonitoring.Api.Data;

public static class DbSeeder
{
    public static async Task InitAsync(AppDbContext db, IConfiguration config)
    {
        await db.Database.MigrateAsync();

        if (!await db.Users.AnyAsync())
        {
            var adminPassword = config["Seed:AdminPassword"];
            var viewerPassword = config["Seed:ViewerPassword"];

            if (string.IsNullOrWhiteSpace(adminPassword) || string.IsNullOrWhiteSpace(viewerPassword))
            {
                throw new InvalidOperationException("Seed:AdminPassword and Seed:ViewerPassword must be configured.");
            }

            db.Users.AddRange(
                new User
                {
                    Email = "admin@sustainabyte.local",
                    DisplayName = "Plant Administrator",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Role = UserRole.Admin,
                },
                new User
                {
                    Email = "viewer@sustainabyte.local",
                    DisplayName = "Operations Observer",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(viewerPassword),
                    Role = UserRole.Viewer,
                }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.Equipment.AnyAsync())
        {
            db.Equipment.AddRange(
                new Equipment { Name = "Generator A", Type = "Generator", Location = "Plant 1 · Bay 2", Status = EquipmentStatus.Faulty, InstalledDate = new(2021, 3, 14), UpdatedAt = DateTime.UtcNow },
                new Equipment { Name = "Hydraulic Pump #2", Type = "Pump", Location = "Plant 1 · Bay 4", Status = EquipmentStatus.Active, InstalledDate = new(2022, 7, 2), UpdatedAt = DateTime.UtcNow },
                new Equipment { Name = "Compressor C-7", Type = "Compressor", Location = "Plant 2 · Utility", Status = EquipmentStatus.Active, InstalledDate = new(2020, 11, 23), UpdatedAt = DateTime.UtcNow },
                new Equipment { Name = "Turbine T-1", Type = "Turbine", Location = "Plant 2 · Hall A", Status = EquipmentStatus.Idle, InstalledDate = new(2019, 5, 30), UpdatedAt = DateTime.UtcNow },
                new Equipment { Name = "Cooling Fan F-3", Type = "Fan", Location = "Plant 1 · Roof", Status = EquipmentStatus.UnderMaintenance, InstalledDate = new(2023, 1, 18), UpdatedAt = DateTime.UtcNow }
            );

            db.Thresholds.AddRange(
                new Threshold { Metric = "temperature", Max = 85 },
                new Threshold { Metric = "vibration", Max = 7 },
                new Threshold { Metric = "pressure", Min = 30, Max = 120 }
            );

            await db.SaveChangesAsync();
        }

        var equipmentList = await db.Equipment.ToListAsync();
        var initialReadings = new List<Reading>();
        var now = DateTime.UtcNow;

        foreach (var eq in equipmentList)
        {
            var hasReadings = await db.Readings.AnyAsync(r => r.EquipmentId == eq.Id);
            if (!hasReadings)
            {
                var baseTemp = eq.Status == EquipmentStatus.Faulty ? 92.4 : eq.Status == EquipmentStatus.Idle ? 26.5 : 74.5;
                var baseVib = eq.Status == EquipmentStatus.Faulty ? 7.8 : eq.Status == EquipmentStatus.Idle ? 0.08 : 3.4;
                var basePress = eq.Status == EquipmentStatus.Faulty ? 122.0 : eq.Status == EquipmentStatus.Idle ? 14.7 : 102.0;
                var baseRuntime = 1000.0 + eq.Id * 250.0;

                for (int i = 10; i >= 0; i--)
                {
                    var ts = now.AddMinutes(-i * 2);
                    var delta = (i % 3 == 0) ? 0.8 : -0.5;
                    initialReadings.Add(new Reading { EquipmentId = eq.Id, Metric = "temperature", Value = Math.Round(baseTemp + delta, 2), Unit = "°C", Timestamp = ts });
                    initialReadings.Add(new Reading { EquipmentId = eq.Id, Metric = "vibration", Value = Math.Round(Math.Max(0, baseVib + delta * 0.1), 2), Unit = "mm/s", Timestamp = ts });
                    initialReadings.Add(new Reading { EquipmentId = eq.Id, Metric = "pressure", Value = Math.Round(basePress + delta * 1.5, 2), Unit = "psi", Timestamp = ts });
                    initialReadings.Add(new Reading { EquipmentId = eq.Id, Metric = "runtime", Value = Math.Round(baseRuntime + (10 - i) * 0.03, 3), Unit = "h", Timestamp = ts });
                }
            }
        }

        if (initialReadings.Count > 0)
        {
            db.Readings.AddRange(initialReadings);
            await db.SaveChangesAsync();
        }

        if (!await db.Alerts.AnyAsync())
        {
            var faultyUnit = await db.Equipment.FirstOrDefaultAsync(e => e.Status == EquipmentStatus.Faulty);
            if (faultyUnit != null)
            {
                db.Alerts.Add(new Alert
                {
                    EquipmentId = faultyUnit.Id,
                    Metric = "temperature",
                    Value = 92.4,
                    ThresholdValue = 85.0,
                    Kind = BreachKind.Max,
                    Status = AlertStatus.Open,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-15)
                });
                await db.SaveChangesAsync();
            }
        }
    }
}
