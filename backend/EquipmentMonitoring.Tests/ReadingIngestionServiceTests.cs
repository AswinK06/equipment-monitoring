using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Models;
using EquipmentMonitoring.Api.Services;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace EquipmentMonitoring.Tests;

public class ReadingIngestionServiceTests
{
    private class FakeNotifier : IRealtimeNotifier
    {
        public List<AlertDto> TriggeredAlerts { get; } = new();
        public List<AlertDto> UpdatedAlerts { get; } = new();
        public List<ReadingsBroadcast> Broadcasts { get; } = new();

        public Task ReadingsReceivedAsync(ReadingsBroadcast broadcast)
        {
            Broadcasts.Add(broadcast);
            return Task.CompletedTask;
        }

        public Task AlertTriggeredAsync(AlertDto alert)
        {
            TriggeredAlerts.Add(alert);
            return Task.CompletedTask;
        }

        public Task AlertUpdatedAsync(AlertDto alert)
        {
            UpdatedAlerts.Add(alert);
            return Task.CompletedTask;
        }
    }

    private class NullCacheService : ICacheService
    {
        public Task<T?> GetAsync<T>(string key) => Task.FromResult<T?>(default);
        public Task SetAsync<T>(string key, T value, TimeSpan ttl) => Task.CompletedTask;
        public Task RemoveAsync(string key) => Task.CompletedTask;
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);

        db.Equipment.Add(new Equipment
        {
            Id = 1,
            Name = "Generator 1",
            Type = "Generator",
            Location = "Sector A",
            Status = EquipmentStatus.Active,
            InstalledDate = DateOnly.FromDateTime(DateTime.UtcNow)
        });

        db.Thresholds.Add(new Threshold
        {
            Metric = "temperature",
            Min = null,
            Max = 85,
            EquipmentId = null
        });

        db.SaveChanges();
        return db;
    }

    [Fact]
    public async Task Ingest_Breach_CreatesOneAlert()
    {
        using var db = CreateContext();
        var notifier = new FakeNotifier();
        var service = new ReadingIngestionService(db, notifier, new NullCacheService());

        var req = new IngestRequest
        {
            Timestamp = DateTime.UtcNow,
            Readings = new List<ReadingInput>
            {
                new() { Metric = "temperature", Value = 95, Unit = "°C" }
            }
        };

        var result = await service.IngestAsync(1, req, CancellationToken.None);

        Assert.Single(result.NewAlerts);
        Assert.Single(await db.Alerts.ToListAsync());
        Assert.Single(notifier.TriggeredAlerts);
    }

    [Fact]
    public async Task Ingest_SecondBreach_WhileUnresolved_CreatesNoNewAlert()
    {
        using var db = CreateContext();
        var notifier = new FakeNotifier();
        var service = new ReadingIngestionService(db, notifier, new NullCacheService());

        var req1 = new IngestRequest
        {
            Timestamp = DateTime.UtcNow,
            Readings = new List<ReadingInput>
            {
                new() { Metric = "temperature", Value = 95, Unit = "°C" }
            }
        };
        await service.IngestAsync(1, req1, CancellationToken.None);

        var req2 = new IngestRequest
        {
            Timestamp = DateTime.UtcNow.AddSeconds(2),
            Readings = new List<ReadingInput>
            {
                new() { Metric = "temperature", Value = 98, Unit = "°C" }
            }
        };
        var result2 = await service.IngestAsync(1, req2, CancellationToken.None);

        Assert.Empty(result2.NewAlerts);
        Assert.Single(await db.Alerts.ToListAsync());
    }

    [Fact]
    public async Task Ingest_AfterResolve_NewBreach_CreatesNewAlert()
    {
        using var db = CreateContext();
        var notifier = new FakeNotifier();
        var service = new ReadingIngestionService(db, notifier, new NullCacheService());
        var alertService = new AlertService(db, notifier, new NullCacheService());

        var req1 = new IngestRequest
        {
            Timestamp = DateTime.UtcNow,
            Readings = new List<ReadingInput>
            {
                new() { Metric = "temperature", Value = 95, Unit = "°C" }
            }
        };
        var result1 = await service.IngestAsync(1, req1, CancellationToken.None);
        var alertId = result1.NewAlerts[0].Id;

        await alertService.SetStatusAsync(alertId, AlertStatus.Resolved, CancellationToken.None);

        var req2 = new IngestRequest
        {
            Timestamp = DateTime.UtcNow.AddSeconds(5),
            Readings = new List<ReadingInput>
            {
                new() { Metric = "temperature", Value = 99, Unit = "°C" }
            }
        };
        var result2 = await service.IngestAsync(1, req2, CancellationToken.None);

        Assert.Single(result2.NewAlerts);
        Assert.Equal(2, await db.Alerts.CountAsync());
    }

    [Fact]
    public async Task Ingest_UnknownEquipment_ThrowsNotFoundException()
    {
        using var db = CreateContext();
        var service = new ReadingIngestionService(db, new FakeNotifier(), new NullCacheService());

        var req = new IngestRequest
        {
            Timestamp = DateTime.UtcNow,
            Readings = new List<ReadingInput>
            {
                new() { Metric = "temperature", Value = 50, Unit = "°C" }
            }
        };

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.IngestAsync(999, req, CancellationToken.None)
        );
    }

    [Fact]
    public async Task History_Returns_Readings_In_Chronological_Order()
    {
        using var db = CreateContext();
        var queryService = new ReadingQueryService(db);
        var now = DateTime.UtcNow;

        db.Readings.AddRange(
            new Reading { EquipmentId = 1, Metric = "temperature", Value = 60, Timestamp = now.AddMinutes(-10) },
            new Reading { EquipmentId = 1, Metric = "temperature", Value = 70, Timestamp = now.AddMinutes(-5) },
            new Reading { EquipmentId = 1, Metric = "temperature", Value = 80, Timestamp = now }
        );
        await db.SaveChangesAsync();

        var result = await queryService.HistoryAsync(1, null, null, null, 100, CancellationToken.None);

        Assert.Equal(3, result.Count);
        Assert.Equal(60, result[0].Value);
        Assert.Equal(70, result[1].Value);
        Assert.Equal(80, result[2].Value);
    }

    [Fact]
    public async Task History_ThrowsNotFound_When_Equipment_Missing()
    {
        using var db = CreateContext();
        var queryService = new ReadingQueryService(db);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            queryService.HistoryAsync(999, null, null, null, 100, CancellationToken.None)
        );
    }

    [Fact]
    public async Task History_ThrowsBadRequest_When_From_After_To()
    {
        using var db = CreateContext();
        var queryService = new ReadingQueryService(db);
        var now = DateTime.UtcNow;

        await Assert.ThrowsAsync<BadRequestException>(() =>
            queryService.HistoryAsync(1, now, now.AddMinutes(-5), null, 100, CancellationToken.None)
        );
    }
}
