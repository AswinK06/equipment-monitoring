namespace EquipmentMonitoring.Api.Dtos;

public record ReadingDto(
    long Id,
    int EquipmentId,
    string Metric,
    double Value,
    string Unit,
    DateTime Timestamp
);
