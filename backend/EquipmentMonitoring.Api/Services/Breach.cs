using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Services;

public record Breach(BreachKind Kind, double Limit);
