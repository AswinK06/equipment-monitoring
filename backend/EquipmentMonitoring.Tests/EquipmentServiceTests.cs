using EquipmentMonitoring.Api.Constants;
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

public class EquipmentServiceTests
{
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

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task ListAsync_ReturnsMostRecentlyUpdatedFirst()
    {
        using var db = CreateContext();
        var baseTime = DateTime.UtcNow;

        var eqOld = new Equipment
        {
            Id = 1,
            Name = "Old Equipment",
            Type = "Pump",
            Location = "Bay 1",
            Status = EquipmentStatus.Active,
            InstalledDate = new DateOnly(2022, 1, 1),
            UpdatedAt = baseTime.AddHours(-2)
        };
        var eqNewest = new Equipment
        {
            Id = 2,
            Name = "Newest Equipment",
            Type = "Turbine",
            Location = "Bay 2",
            Status = EquipmentStatus.Active,
            InstalledDate = new DateOnly(2023, 1, 1),
            UpdatedAt = baseTime
        };
        var eqMid = new Equipment
        {
            Id = 3,
            Name = "Mid Equipment",
            Type = "Generator",
            Location = "Bay 3",
            Status = EquipmentStatus.Idle,
            InstalledDate = new DateOnly(2022, 6, 1),
            UpdatedAt = baseTime.AddHours(-1)
        };

        db.Equipment.AddRange(eqOld, eqNewest, eqMid);
        await db.SaveChangesAsync();

        var service = new EquipmentService(db, new RecordingCacheService());
        var result = await service.ListAsync(CancellationToken.None);

        Assert.Equal(3, result.Count);
        Assert.Equal(eqNewest.Id, result[0].Id);
        Assert.Equal(eqMid.Id, result[1].Id);
        Assert.Equal(eqOld.Id, result[2].Id);
    }

    [Fact]
    public async Task ListAsync_WhenUpdatedAtEqual_OrdersByIdAscending()
    {
        using var db = CreateContext();
        var sameTime = DateTime.UtcNow;

        var eq10 = new Equipment
        {
            Id = 10,
            Name = "Equipment 10",
            Type = "Pump",
            Location = "Bay 1",
            Status = EquipmentStatus.Active,
            InstalledDate = new DateOnly(2022, 1, 1),
            UpdatedAt = sameTime
        };
        var eq5 = new Equipment
        {
            Id = 5,
            Name = "Equipment 5",
            Type = "Pump",
            Location = "Bay 2",
            Status = EquipmentStatus.Active,
            InstalledDate = new DateOnly(2022, 1, 1),
            UpdatedAt = sameTime
        };

        db.Equipment.AddRange(eq10, eq5);
        await db.SaveChangesAsync();

        var service = new EquipmentService(db, new RecordingCacheService());
        var result = await service.ListAsync(CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.Equal(5, result[0].Id);
        Assert.Equal(10, result[1].Id);
    }

    [Fact]
    public async Task UpdateAsync_MakesUpdatedAtLaterThanBefore()
    {
        using var db = CreateContext();
        var pastTime = DateTime.UtcNow.AddMinutes(-10);

        var eq = new Equipment
        {
            Id = 1,
            Name = "Initial Name",
            Type = "Compressor",
            Location = "Bay 4",
            Status = EquipmentStatus.Active,
            InstalledDate = new DateOnly(2021, 5, 1),
            UpdatedAt = pastTime
        };

        db.Equipment.Add(eq);
        await db.SaveChangesAsync();

        var beforeTime = eq.UpdatedAt;
        var service = new EquipmentService(db, new RecordingCacheService());

        var updateRequest = new EquipmentRequest
        {
            Name = "Modified Name",
            Type = "Compressor",
            Location = "Bay 4 - Revised",
            Status = EquipmentStatus.UnderMaintenance,
            InstalledDate = new DateOnly(2021, 5, 1)
        };

        var updatedDto = await service.UpdateAsync(1, updateRequest, CancellationToken.None);

        Assert.True(updatedDto.UpdatedAt > beforeTime);
        Assert.Equal("Modified Name", updatedDto.Name);

        var entityInDb = await db.Equipment.FindAsync(1);
        Assert.NotNull(entityInDb);
        Assert.True(entityInDb.UpdatedAt > beforeTime);
        Assert.Equal(updatedDto.UpdatedAt, entityInDb.UpdatedAt);
    }

    [Fact]
    public async Task DeleteAsync_WithUnknownId_ThrowsNotFoundException()
    {
        using var db = CreateContext();
        var service = new EquipmentService(db, new RecordingCacheService());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.DeleteAsync(999, CancellationToken.None)
        );
    }

    [Fact]
    public async Task DeleteAsync_WithExistingId_RemovesEquipment()
    {
        using var db = CreateContext();
        var cache = new RecordingCacheService();
        var service = new EquipmentService(db, cache);

        var eq = new Equipment
        {
            Id = 1,
            Name = "Equipment 1",
            Type = "Pump",
            Location = "Bay 1",
            Status = EquipmentStatus.Active,
            InstalledDate = new DateOnly(2022, 1, 1),
            UpdatedAt = DateTime.UtcNow
        };
        db.Equipment.Add(eq);
        await db.SaveChangesAsync();

        await service.DeleteAsync(1, CancellationToken.None);

        var entity = await db.Equipment.FindAsync(1);
        Assert.Null(entity);
        Assert.Contains(CacheKeys.EquipmentById(1), cache.RemovedKeys);
        Assert.Contains(CacheKeys.EquipmentList, cache.RemovedKeys);
        Assert.Contains(CacheKeys.DashboardSummary, cache.RemovedKeys);
    }
}
