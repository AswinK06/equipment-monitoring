using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Rules;

public record Breach(BreachKind Kind, double Limit);
