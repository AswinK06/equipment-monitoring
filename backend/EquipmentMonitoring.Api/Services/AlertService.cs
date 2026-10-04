using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Mappings;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

/// <summary>Service implementing alert status lifecycle (Open -> Acknowledged -> Resolved).</summary>
public class AlertService(AppDbContext db, IRealtimeNotifier notifier, ICacheService cache) : IAlertService
{
    public async Task<IReadOnlyList<AlertDto>> ListAsync(bool activeOnly, int? equipmentId, CancellationToken ct)
    {
        var q = db.Alerts.AsNoTracking().AsQueryable();
        if (activeOnly) q = q.Where(a => a.Status != AlertStatus.Resolved);
        if (equipmentId is not null) q = q.Where(a => a.EquipmentId == equipmentId);

        var rows = await q.OrderByDescending(a => a.CreatedAt).Take(500).ToListAsync(ct);
        return rows.Select(a => a.ToDto()).ToList();
    }

    public async Task<AlertDto> SetStatusAsync(int id, AlertStatus target, CancellationToken ct)
    {
        var a = await db.Alerts.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Alert {id} was not found.");

        ValidateStatusTransition(a.Status, target);

        a.Status = target;
        var now = DateTime.UtcNow;
        if (target == AlertStatus.Acknowledged) a.AcknowledgedAt = now;
        if (target == AlertStatus.Resolved)
        {
            a.ResolvedAt = now;
            a.AcknowledgedAt ??= now;
        }

        await db.SaveChangesAsync(ct);
        await cache.RemoveAsync(CacheKeys.DashboardSummary);

        var dto = a.ToDto();
        await notifier.AlertUpdatedAsync(dto);
        return dto;
    }

    private static void ValidateStatusTransition(AlertStatus current, AlertStatus target)
    {
        if (current == AlertStatus.Resolved)
        {
            throw new ConflictException("This alert is already resolved.");
        }
        if (target == AlertStatus.Acknowledged && current != AlertStatus.Open)
        {
            throw new ConflictException("This alert is already acknowledged.");
        }
    }
}
