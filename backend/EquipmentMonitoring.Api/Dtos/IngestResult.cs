namespace EquipmentMonitoring.Api.Dtos;

public record IngestResult(int Saved, IReadOnlyList<AlertDto> NewAlerts);
