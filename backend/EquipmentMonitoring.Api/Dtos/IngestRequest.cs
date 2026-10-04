using System.ComponentModel.DataAnnotations;

namespace EquipmentMonitoring.Api.Dtos;

/// <summary>Body of POST /api/equipment/{id}/readings and the MQTT payload on equipment/{id}/readings.</summary>
public class IngestRequest
{
    public DateTime? Timestamp { get; set; }

    [Required, MinLength(1)]
    public List<ReadingInput> Readings { get; set; } = new();
}
