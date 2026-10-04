using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Models;

namespace EquipmentMonitoring.Api.Mappings;

public static class MappingExtensions
{
    public static EquipmentDto ToDto(this Equipment e) =>
        new(e.Id, e.Name, e.Type, e.Location, e.Status, e.InstalledDate, e.UpdatedAt);

    public static ReadingDto ToDto(this Reading r) =>
        new(r.Id, r.EquipmentId, r.Metric, r.Value, r.Unit, r.Timestamp);

    public static AlertDto ToDto(this Alert a) =>
        new(a.Id, a.EquipmentId, a.Metric, a.Value, a.ThresholdValue, a.Kind, a.Status, a.CreatedAt, a.AcknowledgedAt, a.ResolvedAt);
}
