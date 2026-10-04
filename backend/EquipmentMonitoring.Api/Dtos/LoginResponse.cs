namespace EquipmentMonitoring.Api.Dtos;

public record LoginResponse(
    string AccessToken,
    DateTime ExpiresAt,
    string Email,
    string DisplayName,
    string Role
);
