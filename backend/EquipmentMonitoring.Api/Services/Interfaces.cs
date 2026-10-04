using EquipmentMonitoring.Api.Domain;
using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services;

public interface IEquipmentService
{
    Task<IReadOnlyList<EquipmentDto>> ListAsync(CancellationToken ct);
    Task<EquipmentDto> GetAsync(int id, CancellationToken ct);
    Task<EquipmentDto> CreateAsync(EquipmentRequest r, CancellationToken ct);
    Task<EquipmentDto> UpdateAsync(int id, EquipmentRequest r, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}

public interface IReadingService
{
    Task<IngestResult> IngestAsync(int equipmentId, IngestRequest request, CancellationToken ct);
    Task<IReadOnlyList<ReadingDto>> HistoryAsync(int equipmentId, DateTime? from, DateTime? to, string? metric, int limit, CancellationToken ct);
}

public interface IAlertService
{
    Task<IReadOnlyList<AlertDto>> ListAsync(bool activeOnly, int? equipmentId, CancellationToken ct);
    Task<AlertDto> SetStatusAsync(int id, AlertStatus target, CancellationToken ct);
}

/// <summary>Keeps services independent of SignalR; swap the implementation to change transport.</summary>
public interface IRealtimeNotifier
{
    Task ReadingsReceivedAsync(ReadingsBroadcast message);
    Task AlertTriggeredAsync(AlertDto alert);
    Task AlertUpdatedAsync(AlertDto alert);
}
