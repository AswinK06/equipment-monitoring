using System.ComponentModel.DataAnnotations;
using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Dtos;

public class EquipmentRequest
{
    [Required, StringLength(120, MinimumLength = 1)]
    public string Name { get; set; } = "";

    [Required, StringLength(60, MinimumLength = 1)]
    public string Type { get; set; } = "";

    [Required, StringLength(120, MinimumLength = 1)]
    public string Location { get; set; } = "";

    [Required]
    public EquipmentStatus? Status { get; set; }

    [Required]
    public DateOnly? InstalledDate { get; set; }
}
