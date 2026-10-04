using EquipmentMonitoring.Api.Models;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
