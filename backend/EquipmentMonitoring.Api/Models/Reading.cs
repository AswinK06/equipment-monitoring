namespace EquipmentMonitoring.Api.Models;

public class Reading
{
    public long Id { get; set; }
    public int EquipmentId { get; set; }
    public string Metric { get; set; } = "";
    public double Value { get; set; }
    public string Unit { get; set; } = "";
    public DateTime Timestamp { get; set; }
}
