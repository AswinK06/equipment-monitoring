using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

/// <summary>Sensor reading ingestion and historical query service.</summary>
public interface IReadingService
{
    /// <summary>Ingests sensor readings for an equipment, checks thresholds, and generates alerts if needed.</summary>
    Task<IngestResult> IngestAsync(int equipmentId, IngestRequest request, CancellationToken ct);

    /// <summary>Queries historical readings for an equipment with optional date range and metric filter.</summary>
    Task<IReadOnlyList<ReadingDto>> HistoryAsync(int equipmentId, DateTime? from, DateTime? to, string? metric, int limit, CancellationToken ct);
}
