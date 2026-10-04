using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Dtos;

public record EquipmentDto(
    int Id,
    string Name,
    string Type,
    string Location,
    EquipmentStatus Status,
    DateOnly InstalledDate
);
