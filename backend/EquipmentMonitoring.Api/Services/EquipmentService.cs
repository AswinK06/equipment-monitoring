using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Mappings;
using EquipmentMonitoring.Api.Models;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

/// <summary>Service implementing equipment CRUD operations with caching.</summary>
public class EquipmentService(AppDbContext db, ICacheService cache) : IEquipmentService
{
    public async Task<IReadOnlyList<EquipmentDto>> ListAsync(CancellationToken ct)
    {
        var cached = await cache.GetAsync<IReadOnlyList<EquipmentDto>>(CacheKeys.EquipmentList);
        if (cached != null) return cached;

        var list = (await db.Equipment.AsNoTracking().OrderBy(e => e.Id).ToListAsync(ct))
            .Select(e => e.ToDto())
            .ToList();

        await cache.SetAsync(CacheKeys.EquipmentList, list, TimeSpan.FromSeconds(60));
        return list;
    }

    public async Task<EquipmentDto> GetAsync(int id, CancellationToken ct)
    {
        var key = CacheKeys.EquipmentById(id);
        var cached = await cache.GetAsync<EquipmentDto>(key);
        if (cached != null) return cached;

        var dto = (await FindAsync(id, ct)).ToDto();
        await cache.SetAsync(key, dto, TimeSpan.FromSeconds(60));
        return dto;
    }

    public async Task<EquipmentDto> CreateAsync(EquipmentRequest r, CancellationToken ct)
    {
        var e = new Equipment();
        Apply(e, r);
        db.Equipment.Add(e);
        await db.SaveChangesAsync(ct);
        await InvalidateCacheAsync(e.Id);
        return e.ToDto();
    }

    public async Task<EquipmentDto> UpdateAsync(int id, EquipmentRequest r, CancellationToken ct)
    {
        var e = await FindAsync(id, ct);
        Apply(e, r);
        await db.SaveChangesAsync(ct);
        await InvalidateCacheAsync(id);
        return e.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var e = await FindAsync(id, ct);
        db.Equipment.Remove(e);
        await db.SaveChangesAsync(ct);
        await InvalidateCacheAsync(id);
    }

    private async Task InvalidateCacheAsync(int id)
    {
        await cache.RemoveAsync(CacheKeys.EquipmentList);
        await cache.RemoveAsync(CacheKeys.EquipmentById(id));
        await cache.RemoveAsync(CacheKeys.DashboardSummary);
    }

    private async Task<Equipment> FindAsync(int id, CancellationToken ct) =>
        await db.Equipment.FirstOrDefaultAsync(e => e.Id == id, ct)
        ?? throw new NotFoundException($"Equipment {id} was not found.");

    private static void Apply(Equipment e, EquipmentRequest r)
    {
        e.Name = r.Name.Trim();
        e.Type = r.Type.Trim();
        e.Location = r.Location.Trim();
        e.Status = r.Status!.Value;
        e.InstalledDate = r.InstalledDate!.Value;
    }
}
