using EquipmentMonitoring.Api.Constants;
using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;
    private readonly ICacheService _cache;

    public DashboardService(AppDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var cached = await _cache.GetAsync<DashboardSummaryDto>(CacheKeys.DashboardSummary);
        if (cached != null) return cached;

        var summary = await BuildSummaryFromDbAsync(ct);
        await _cache.SetAsync(CacheKeys.DashboardSummary, summary, TimeSpan.FromSeconds(15));
        return summary;
    }

    private async Task<DashboardSummaryDto> BuildSummaryFromDbAsync(CancellationToken ct)
    {
        var equipment = await _db.Equipment.AsNoTracking().ToListAsync(ct);
        var counts = Enum.GetValues<EquipmentStatus>().ToDictionary(s => s.ToString(), _ => 0);
        foreach (var e in equipment)
        {
            var key = e.Status.ToString();
            counts[key] = counts.GetValueOrDefault(key, 0) + 1;
        }

        var active = await _db.Alerts.CountAsync(a => a.Status != AlertStatus.Resolved, ct);
        var open = await _db.Alerts.CountAsync(a => a.Status == AlertStatus.Open, ct);
        var ack = await _db.Alerts.CountAsync(a => a.Status == AlertStatus.Acknowledged, ct);

        return new DashboardSummaryDto(equipment.Count, counts, active, open, ack);
    }
}
