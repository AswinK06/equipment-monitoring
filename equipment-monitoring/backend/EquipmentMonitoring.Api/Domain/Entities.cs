namespace EquipmentMonitoring.Api.Domain;

public enum EquipmentStatus { Active, Idle, Faulty, UnderMaintenance }
public enum AlertStatus { Open, Acknowledged, Resolved }
public enum BreachKind { Min, Max }

public class Equipment
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string Location { get; set; } = "";
    public EquipmentStatus Status { get; set; }
    public DateOnly InstalledDate { get; set; }
    public List<Reading> Readings { get; set; } = new();
    public List<Alert> Alerts { get; set; } = new();
}

public class Reading
{
    public long Id { get; set; }
    public int EquipmentId { get; set; }
    public string Metric { get; set; } = "";
    public double Value { get; set; }
    public string Unit { get; set; } = "";
    public DateTime Timestamp { get; set; }
}

/// <summary>Min/Max limit for a metric. EquipmentId == null is the global default; a row with an EquipmentId overrides it.</summary>
public class Threshold
{
    public int Id { get; set; }
    public int? EquipmentId { get; set; }
    public string Metric { get; set; } = "";
    public double? Min { get; set; }
    public double? Max { get; set; }
}

public class Alert
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public string Metric { get; set; } = "";
    public double Value { get; set; }
    public double ThresholdValue { get; set; }
    public BreachKind Kind { get; set; }
    public AlertStatus Status { get; set; } = AlertStatus.Open;
    public DateTime CreatedAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
