using System.ComponentModel.DataAnnotations;

namespace EquipmentMonitoring.Api.Dtos;

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MinLength(1)]
    public string Password { get; set; } = "";
}
