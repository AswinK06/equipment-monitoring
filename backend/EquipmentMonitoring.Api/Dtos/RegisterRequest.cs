using System.ComponentModel.DataAnnotations;

namespace EquipmentMonitoring.Api.Dtos;

public class RegisterRequest
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string DisplayName { get; set; } = "";

    [Required, EmailAddress, MaxLength(254)]
    public string Email { get; set; } = "";

    [Required, StringLength(100, MinimumLength = 8), RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).+$", ErrorMessage = "Password must contain at least one letter and one number.")]
    public string Password { get; set; } = "";
}
