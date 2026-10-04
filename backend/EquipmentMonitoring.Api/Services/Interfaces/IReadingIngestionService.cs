using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IReadingIngestionService
{
    Task<IngestResult> IngestAsync(int equipmentId, IngestRequest request, CancellationToken ct);
}
