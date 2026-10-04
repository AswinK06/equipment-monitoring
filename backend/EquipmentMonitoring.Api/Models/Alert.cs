using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Models;

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
