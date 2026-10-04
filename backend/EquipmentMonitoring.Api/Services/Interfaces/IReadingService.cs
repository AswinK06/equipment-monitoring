using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IReadingService
{
    Task<IngestResult> IngestAsync(int equipmentId, IngestRequest request, CancellationToken ct);

    Task<IReadOnlyList<ReadingDto>> HistoryAsync(int equipmentId, DateTime? from, DateTime? to, string? metric, int limit, CancellationToken ct);
}
