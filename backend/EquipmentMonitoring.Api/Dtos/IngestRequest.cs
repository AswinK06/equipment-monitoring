using System.ComponentModel.DataAnnotations;

namespace EquipmentMonitoring.Api.Dtos;

public class IngestRequest
{
    public DateTime? Timestamp { get; set; }

    [Required, MinLength(1)]
    public List<ReadingInput> Readings { get; set; } = new();
}
