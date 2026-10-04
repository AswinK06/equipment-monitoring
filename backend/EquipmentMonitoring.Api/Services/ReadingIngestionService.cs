using EquipmentMonitoring.Api.Constants;
using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Helpers;
using EquipmentMonitoring.Api.Mappings;
using EquipmentMonitoring.Api.Models;
using EquipmentMonitoring.Api.Rules;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class ReadingIngestionService(AppDbContext db, IRealtimeNotifier notifier, ICacheService cache) : IReadingIngestionService
{
    public async Task<IngestResult> IngestAsync(int equipmentId, IngestRequest request, CancellationToken ct)
    {
        var eq = await db.Equipment.AsNoTracking().FirstOrDefaultAsync(e => e.Id == equipmentId, ct);
        if (eq is null)
        {
            throw new NotFoundException($"Equipment {equipmentId} was not found.");
        }

        if (eq.Status is EquipmentStatus.Faulty or EquipmentStatus.UnderMaintenance)
        {
            return new IngestResult(0, Array.Empty<AlertDto>());
        }

        var ts = (request.Timestamp ?? DateTime.UtcNow).ToUtc();
        var thresholds = await LoadThresholdsAsync(equipmentId, ct);
        var unresolvedAlerts = await LoadUnresolvedAlertsAsync(equipmentId, ct);

        SaveReadings(equipmentId, request.Readings, ts);
        var newAlerts = EvaluateAlerts(equipmentId, request.Readings, thresholds, unresolvedAlerts, ts);

        db.Alerts.AddRange(newAlerts);
        await db.SaveChangesAsync(ct);

        if (newAlerts.Count > 0)
        {
            await cache.RemoveAsync(CacheKeys.DashboardSummary);
        }

        var alertDtos = newAlerts.Select(a => a.ToDto()).ToList();
        await SendLiveUpdatesAsync(equipmentId, request.Readings, alertDtos, ts);

        return new IngestResult(request.Readings.Count, alertDtos);
    }

    private Task<List<Threshold>> LoadThresholdsAsync(int equipmentId, CancellationToken ct) =>
        db.Thresholds.AsNoTracking()
            .Where(t => t.EquipmentId == null || t.EquipmentId == equipmentId)
            .ToListAsync(ct);

    private Task<List<Alert>> LoadUnresolvedAlertsAsync(int equipmentId, CancellationToken ct) =>
        db.Alerts
            .Where(a => a.EquipmentId == equipmentId && a.Status != AlertStatus.Resolved)
            .ToListAsync(ct);

    private void SaveReadings(int equipmentId, IEnumerable<ReadingInput> inputs, DateTime ts)
    {
        foreach (var input in inputs)
        {
            db.Readings.Add(new Reading
            {
                EquipmentId = equipmentId,
                Metric = input.Metric,
                Value = input.Value!.Value,
                Unit = input.Unit,
                Timestamp = ts,
            });
        }
    }

    private static List<Alert> EvaluateAlerts(
        int equipmentId,
        IEnumerable<ReadingInput> inputs,
        List<Threshold> thresholds,
        List<Alert> unresolved,
        DateTime ts
    )
    {
        var newAlerts = new List<Alert>();
        foreach (var input in inputs)
        {
            var value = input.Value!.Value;
            var t = FindThreshold(thresholds, equipmentId, input.Metric);
            if (t is null) continue;

            var breach = ThresholdEvaluator.Evaluate(value, t.Min, t.Max);
            if (breach is null) continue;

            // At most one unresolved alert per equipment + metric + breach direction
            var alreadyUnresolved = unresolved.Concat(newAlerts)
                .Any(a => a.Metric == input.Metric && a.Kind == breach.Kind);
            if (alreadyUnresolved) continue;

            newAlerts.Add(new Alert
            {
                EquipmentId = equipmentId,
                Metric = input.Metric,
                Value = value,
                ThresholdValue = breach.Limit,
                Kind = breach.Kind,
                CreatedAt = ts,
            });
        }
        return newAlerts;
    }

    private static Threshold? FindThreshold(List<Threshold> thresholds, int equipmentId, string metric) =>
        thresholds.FirstOrDefault(x => x.EquipmentId == equipmentId && x.Metric == metric)
        ?? thresholds.FirstOrDefault(x => x.EquipmentId == null && x.Metric == metric);

    private async Task SendLiveUpdatesAsync(
        int equipmentId,
        IEnumerable<ReadingInput> inputs,
        IReadOnlyList<AlertDto> alertDtos,
        DateTime ts
    )
    {
        var broadcastItems = inputs.Select(r => new ReadingBroadcastItem(r.Metric, r.Value!.Value, r.Unit)).ToList();
        await notifier.ReadingsReceivedAsync(new ReadingsBroadcast(equipmentId, ts, broadcastItems));

        foreach (var alert in alertDtos)
        {
            await notifier.AlertTriggeredAsync(alert);
        }
    }
}
