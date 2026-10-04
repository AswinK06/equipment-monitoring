using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Helpers;
using EquipmentMonitoring.Api.Mappings;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class ReadingQueryService(AppDbContext db) : IReadingQueryService
{
    public async Task<IReadOnlyList<ReadingDto>> HistoryAsync(
        int equipmentId,
        DateTime? from,
        DateTime? to,
        string? metric,
        int limit,
        CancellationToken ct
    )
    {
        await EnsureEquipmentExistsAsync(equipmentId, ct);
        if (from is not null && to is not null && from > to)
        {
            throw new BadRequestException("'from' must be earlier than 'to'.");
        }

        var q = db.Readings.AsNoTracking().Where(r => r.EquipmentId == equipmentId);
        if (from is not null) q = q.Where(r => r.Timestamp >= from.Value.ToUtc());
        if (to is not null) q = q.Where(r => r.Timestamp <= to.Value.ToUtc());
        if (!string.IsNullOrWhiteSpace(metric)) q = q.Where(r => r.Metric == metric);

        var clampedLimit = Math.Clamp(limit, 1, 5000);
        var rows = await q.OrderByDescending(r => r.Timestamp).ThenByDescending(r => r.Id)
            .Take(clampedLimit).ToListAsync(ct);
        rows.Reverse();
        return rows.Select(r => r.ToDto()).ToList();
    }

    private async Task EnsureEquipmentExistsAsync(int equipmentId, CancellationToken ct)
    {
        if (!await db.Equipment.AnyAsync(e => e.Id == equipmentId, ct))
        {
            throw new NotFoundException($"Equipment {equipmentId} was not found.");
        }
    }
}
