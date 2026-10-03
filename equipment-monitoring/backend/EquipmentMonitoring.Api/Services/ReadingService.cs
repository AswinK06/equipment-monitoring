using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Domain;
using EquipmentMonitoring.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class ReadingService(AppDbContext db, IRealtimeNotifier notifier) : IReadingService
{
    public static DateTime AsUtc(DateTime d) => d.Kind switch
    {
        DateTimeKind.Utc => d,
        DateTimeKind.Local => d.ToUniversalTime(),
        _ => DateTime.SpecifyKind(d, DateTimeKind.Utc),
    };

    /// <summary>Persists readings, evaluates thresholds, opens alerts (at most one unresolved alert per equipment+metric+kind) and pushes everything to clients.</summary>
    public async Task<IngestResult> IngestAsync(int equipmentId, IngestRequest request, CancellationToken ct)
    {
        if (!await db.Equipment.AnyAsync(e => e.Id == equipmentId, ct))
            throw new NotFoundException($"Equipment {equipmentId} was not found.");

        var ts = AsUtc(request.Timestamp ?? DateTime.UtcNow);
        var thresholds = await db.Thresholds.AsNoTracking()
            .Where(t => t.EquipmentId == null || t.EquipmentId == equipmentId).ToListAsync(ct);
        var unresolved = await db.Alerts
            .Where(a => a.EquipmentId == equipmentId && a.Status != AlertStatus.Resolved).ToListAsync(ct);

        var newAlerts = new List<Alert>();
        foreach (var input in request.Readings)
        {
            var value = input.Value!.Value;
            db.Readings.Add(new Reading { EquipmentId = equipmentId, Metric = input.Metric, Value = value, Unit = input.Unit, Timestamp = ts });

            var t = thresholds.FirstOrDefault(x => x.EquipmentId == equipmentId && x.Metric == input.Metric)
                    ?? thresholds.FirstOrDefault(x => x.EquipmentId == null && x.Metric == input.Metric);
            if (t is null) continue;
            var breach = ThresholdEvaluator.Evaluate(value, t.Min, t.Max);
            if (breach is null) continue;
            if (unresolved.Concat(newAlerts).Any(a => a.Metric == input.Metric && a.Kind == breach.Kind)) continue;

            newAlerts.Add(new Alert
            {
                EquipmentId = equipmentId, Metric = input.Metric, Value = value,
                ThresholdValue = breach.Limit, Kind = breach.Kind, CreatedAt = ts,
            });
        }

        db.Alerts.AddRange(newAlerts);
        await db.SaveChangesAsync(ct);

        await notifier.ReadingsReceivedAsync(new ReadingsBroadcast(equipmentId, ts,
            request.Readings.Select(r => new ReadingBroadcastItem(r.Metric, r.Value!.Value, r.Unit)).ToList()));
        var dtos = newAlerts.Select(a => a.ToDto()).ToList();
        foreach (var a in dtos) await notifier.AlertTriggeredAsync(a);
        return new IngestResult(request.Readings.Count, dtos);
    }

    public async Task<IReadOnlyList<ReadingDto>> HistoryAsync(int equipmentId, DateTime? from, DateTime? to, string? metric, int limit, CancellationToken ct)
    {
        if (!await db.Equipment.AnyAsync(e => e.Id == equipmentId, ct))
            throw new NotFoundException($"Equipment {equipmentId} was not found.");
        if (from is not null && to is not null && from > to)
            throw new BadRequestException("'from' must be earlier than 'to'.");

        var q = db.Readings.AsNoTracking().Where(r => r.EquipmentId == equipmentId);
        if (from is not null) { var f = AsUtc(from.Value); q = q.Where(r => r.Timestamp >= f); }
        if (to is not null) { var t = AsUtc(to.Value); q = q.Where(r => r.Timestamp <= t); }
        if (!string.IsNullOrWhiteSpace(metric)) q = q.Where(r => r.Metric == metric);

        var rows = await q.OrderByDescending(r => r.Timestamp).ThenByDescending(r => r.Id)
            .Take(Math.Clamp(limit, 1, 5000)).ToListAsync(ct);
        rows.Reverse(); // oldest first, ready for charts
        return rows.Select(r => r.ToDto()).ToList();
    }
}
