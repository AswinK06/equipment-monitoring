using EquipmentMonitoring.Api.Constants;
using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Services;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace EquipmentMonitoring.Tests;

public class CacheTests
{
    private class ThrowingDistributedCache : IDistributedCache
    {
        public byte[]? Get(string key) => throw new InvalidOperationException("Redis down");
        public Task<byte[]?> GetAsync(string key, CancellationToken token = default) =>
            throw new InvalidOperationException("Redis down");
        public void Set(string key, byte[] value, DistributedCacheEntryOptions options) =>
            throw new InvalidOperationException("Redis down");
        public Task SetAsync(string key, byte[] value, DistributedCacheEntryOptions options, CancellationToken token = default) =>
            throw new InvalidOperationException("Redis down");
        public void Refresh(string key) => throw new InvalidOperationException("Redis down");
        public Task RefreshAsync(string key, CancellationToken token = default) =>
            throw new InvalidOperationException("Redis down");
        public void Remove(string key) => throw new InvalidOperationException("Redis down");
        public Task RemoveAsync(string key, CancellationToken token = default) =>
            throw new InvalidOperationException("Redis down");
    }

    private class RecordingCacheService : ICacheService
    {
        public List<string> RemovedKeys { get; } = new();

        public Task<T?> GetAsync<T>(string key) => Task.FromResult<T?>(default);
        public Task SetAsync<T>(string key, T value, TimeSpan ttl) => Task.CompletedTask;
        public Task RemoveAsync(string key)
        {
            RemovedKeys.Add(key);
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task CacheService_ReturnsNull_WhenUnderlyingCacheThrows()
    {
        var cacheService = new CacheService(new ThrowingDistributedCache(), NullLogger<CacheService>.Instance);

        var result = await cacheService.GetAsync<string>("some-key");

        Assert.Null(result);
    }

    [Fact]
    public async Task EquipmentService_Create_RemovesListKey()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        using var db = new AppDbContext(options);
        var fakeCache = new RecordingCacheService();
        var service = new EquipmentService(db, fakeCache);

        var req = new EquipmentRequest
        {
            Name = "Pump A",
            Type = "Pump",
            Location = "Plant 1",
            Status = EquipmentStatus.Active,
            InstalledDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        await service.CreateAsync(req, CancellationToken.None);

        Assert.Contains(CacheKeys.EquipmentList, fakeCache.RemovedKeys);
        Assert.Contains(CacheKeys.DashboardSummary, fakeCache.RemovedKeys);
    }
}
