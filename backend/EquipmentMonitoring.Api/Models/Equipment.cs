using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Models;

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
