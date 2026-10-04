using EquipmentMonitoring.Api.Models;

namespace EquipmentMonitoring.Api.Services.Interfaces;

/// <summary>JWT token generation service.</summary>
public interface ITokenService
{
    /// <summary>Generates a signed JWT access token and its expiration timestamp for the given user.</summary>
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
