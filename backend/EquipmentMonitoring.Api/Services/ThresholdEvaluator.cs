using EquipmentMonitoring.Api.Domain;

namespace EquipmentMonitoring.Api.Services;

public record Breach(BreachKind Kind, double Limit);

/// <summary>Pure alert rule: strictly above Max or strictly below Min is a breach. Equal to a limit is safe.</summary>
public static class ThresholdEvaluator
{
    public static Breach? Evaluate(double value, double? min, double? max)
    {
        if (max is not null && value > max) return new Breach(BreachKind.Max, max.Value);
        if (min is not null && value < min) return new Breach(BreachKind.Min, min.Value);
        return null;
    }
}
