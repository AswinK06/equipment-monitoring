using System.ComponentModel.DataAnnotations;

namespace EquipmentMonitoring.Api.Dtos;

public class ReadingInput
{
    [Required, StringLength(40)]
    public string Metric { get; set; } = "";

    [Required]
    public double? Value { get; set; }

    [StringLength(20)]
    public string Unit { get; set; } = "";
}
