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

public class AlertServiceTests
{
    private class FakeNotifier : IRealtimeNotifier
    {
        public List<AlertDto> UpdatedAlerts { get; } = new();

        public Task ReadingsReceivedAsync(ReadingsBroadcast broadcast) => Task.CompletedTask;
        public Task AlertTriggeredAsync(AlertDto alert) => Task.CompletedTask;
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

        db.Alerts.Add(new Alert
        {
            Id = 1,
            EquipmentId = 10,
            Metric = "pressure",
            Value = 135,
            ThresholdValue = 120,
            Kind = BreachKind.Max,
            Status = AlertStatus.Open,
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
        return db;
    }

    [Fact]
    public async Task StatusLifecycle_OpenToAcknowledgedToResolved_Works()
    {
        using var db = CreateContext();
        var notifier = new FakeNotifier();
        var service = new AlertService(db, notifier, new NullCacheService());

        var acked = await service.SetStatusAsync(1, AlertStatus.Acknowledged, CancellationToken.None);
        Assert.Equal(AlertStatus.Acknowledged, acked.Status);
        Assert.NotNull(acked.AcknowledgedAt);

        var resolved = await service.SetStatusAsync(1, AlertStatus.Resolved, CancellationToken.None);
        Assert.Equal(AlertStatus.Resolved, resolved.Status);
        Assert.NotNull(resolved.ResolvedAt);
        Assert.Equal(2, notifier.UpdatedAlerts.Count);
    }

    [Fact]
    public async Task StatusLifecycle_ResolvedToAnything_ThrowsConflictException()
    {
        using var db = CreateContext();
        var notifier = new FakeNotifier();
        var service = new AlertService(db, notifier, new NullCacheService());

        await service.SetStatusAsync(1, AlertStatus.Resolved, CancellationToken.None);

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.SetStatusAsync(1, AlertStatus.Open, CancellationToken.None)
        );

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.SetStatusAsync(1, AlertStatus.Acknowledged, CancellationToken.None)
        );
    }

    [Fact]
    public async Task StatusLifecycle_AcknowledgingTwice_ThrowsConflictException()
    {
        using var db = CreateContext();
        var notifier = new FakeNotifier();
        var service = new AlertService(db, notifier, new NullCacheService());

        await service.SetStatusAsync(1, AlertStatus.Acknowledged, CancellationToken.None);

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.SetStatusAsync(1, AlertStatus.Acknowledged, CancellationToken.None)
        );
    }
}
