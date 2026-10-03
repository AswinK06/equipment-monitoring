using EquipmentMonitoring.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Data;

public static class DbSeeder
{
    /// <summary>Applies migrations (or creates the schema if none exist yet) and seeds demo data once.</summary>
    public static async Task InitAsync(AppDbContext db)
    {
        if (db.Database.GetMigrations().Any()) await db.Database.MigrateAsync();
        else await db.Database.EnsureCreatedAsync();

        if (await db.Equipment.AnyAsync()) return;

        db.Equipment.AddRange(
            new Equipment { Name = "Generator A", Type = "Generator", Location = "Plant 1 · Bay 2", Status = EquipmentStatus.Faulty, InstalledDate = new(2021, 3, 14) },
            new Equipment { Name = "Hydraulic Pump #2", Type = "Pump", Location = "Plant 1 · Bay 4", Status = EquipmentStatus.Active, InstalledDate = new(2022, 7, 2) },
            new Equipment { Name = "Compressor C-7", Type = "Compressor", Location = "Plant 2 · Utility", Status = EquipmentStatus.Active, InstalledDate = new(2020, 11, 23) },
            new Equipment { Name = "Turbine T-1", Type = "Turbine", Location = "Plant 2 · Hall A", Status = EquipmentStatus.Idle, InstalledDate = new(2019, 5, 30) },
            new Equipment { Name = "Cooling Fan F-3", Type = "Fan", Location = "Plant 1 · Roof", Status = EquipmentStatus.UnderMaintenance, InstalledDate = new(2023, 1, 18) });

        db.Thresholds.AddRange(
            new Threshold { Metric = "temperature", Max = 85 },
            new Threshold { Metric = "vibration", Max = 7 },
            new Threshold { Metric = "pressure", Min = 30, Max = 120 });

        await db.SaveChangesAsync();
    }
}
