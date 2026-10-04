using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Dtos;

public record AlertDto(
    int Id,
    int EquipmentId,
    string Metric,
    double Value,
    double Threshold,
    BreachKind Kind,
    AlertStatus Status,
    DateTime CreatedAt,
    DateTime? AcknowledgedAt,
    DateTime? ResolvedAt
);
