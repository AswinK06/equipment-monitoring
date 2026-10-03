using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Domain;
using EquipmentMonitoring.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class AlertService(AppDbContext db, IRealtimeNotifier notifier) : IAlertService
{
    public async Task<IReadOnlyList<AlertDto>> ListAsync(bool activeOnly, int? equipmentId, CancellationToken ct)
    {
        var q = db.Alerts.AsNoTracking().AsQueryable();
        if (activeOnly) q = q.Where(a => a.Status != AlertStatus.Resolved);
        if (equipmentId is not null) q = q.Where(a => a.EquipmentId == equipmentId);
        var rows = await q.OrderByDescending(a => a.CreatedAt).Take(500).ToListAsync(ct);
        return rows.Select(a => a.ToDto()).ToList();
    }

    /// <summary>Open → Acknowledged → Resolved (Open may go straight to Resolved). Resolved is final.</summary>
    public async Task<AlertDto> SetStatusAsync(int id, AlertStatus target, CancellationToken ct)
    {
        var a = await db.Alerts.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NotFoundException($"Alert {id} was not found.");
        if (a.Status == AlertStatus.Resolved) throw new ConflictException("This alert is already resolved.");
        if (target == AlertStatus.Acknowledged && a.Status != AlertStatus.Open) throw new ConflictException("This alert is already acknowledged.");

        a.Status = target;
        var now = DateTime.UtcNow;
        if (target == AlertStatus.Acknowledged) a.AcknowledgedAt = now;
        if (target == AlertStatus.Resolved) { a.ResolvedAt = now; a.AcknowledgedAt ??= now; }
        await db.SaveChangesAsync(ct);

        var dto = a.ToDto();
        await notifier.AlertUpdatedAsync(dto);
        return dto;
    }
}
