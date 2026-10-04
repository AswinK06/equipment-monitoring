using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IReadingQueryService
{
    Task<IReadOnlyList<ReadingDto>> HistoryAsync(int equipmentId, DateTime? from, DateTime? to, string? metric, int limit, CancellationToken ct);
}
