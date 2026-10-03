using System.ComponentModel.DataAnnotations;
using EquipmentMonitoring.Api.Domain;

namespace EquipmentMonitoring.Api.Dtos;

public class EquipmentRequest
{
    [Required, StringLength(120, MinimumLength = 1)] public string Name { get; set; } = "";
    [Required, StringLength(60, MinimumLength = 1)] public string Type { get; set; } = "";
    [Required, StringLength(120, MinimumLength = 1)] public string Location { get; set; } = "";
    [Required] public EquipmentStatus? Status { get; set; }
    [Required] public DateOnly? InstalledDate { get; set; }
}

public record EquipmentDto(int Id, string Name, string Type, string Location, EquipmentStatus Status, DateOnly InstalledDate);

public class ReadingInput
{
    [Required, StringLength(40)] public string Metric { get; set; } = "";
    [Required] public double? Value { get; set; }
    [StringLength(20)] public string Unit { get; set; } = "";
}

/// <summary>Body of POST /api/equipment/{id}/readings and the MQTT payload on equipment/{id}/readings.</summary>
public class IngestRequest
{
    public DateTime? Timestamp { get; set; }
    [Required, MinLength(1)] public List<ReadingInput> Readings { get; set; } = new();
}

public record ReadingDto(long Id, int EquipmentId, string Metric, double Value, string Unit, DateTime Timestamp);
public record AlertDto(int Id, int EquipmentId, string Metric, double Value, double Threshold, BreachKind Kind,
    AlertStatus Status, DateTime CreatedAt, DateTime? AcknowledgedAt, DateTime? ResolvedAt);
public record ReadingBroadcastItem(string Metric, double Value, string Unit);
public record ReadingsBroadcast(int EquipmentId, DateTime Timestamp, IReadOnlyList<ReadingBroadcastItem> Readings);
public record IngestResult(int Saved, IReadOnlyList<AlertDto> NewAlerts);

public static class Mapping
{
    public static EquipmentDto ToDto(this Equipment e) => new(e.Id, e.Name, e.Type, e.Location, e.Status, e.InstalledDate);
    public static ReadingDto ToDto(this Reading r) => new(r.Id, r.EquipmentId, r.Metric, r.Value, r.Unit, r.Timestamp);
    public static AlertDto ToDto(this Alert a) => new(a.Id, a.EquipmentId, a.Metric, a.Value, a.ThresholdValue, a.Kind, a.Status, a.CreatedAt, a.AcknowledgedAt, a.ResolvedAt);
}
