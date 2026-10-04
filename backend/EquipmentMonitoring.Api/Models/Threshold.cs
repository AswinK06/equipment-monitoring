namespace EquipmentMonitoring.Api.Models;

/// <summary>Min/Max limit for a metric. EquipmentId == null is the global default; a row with an EquipmentId overrides it.</summary>
public class Threshold
{
    public int Id { get; set; }
    public int? EquipmentId { get; set; }
    public string Metric { get; set; } = "";
    public double? Min { get; set; }
    public double? Max { get; set; }
}
