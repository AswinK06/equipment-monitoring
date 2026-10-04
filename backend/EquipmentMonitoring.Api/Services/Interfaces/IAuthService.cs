using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(string email, string password, CancellationToken ct);

    Task<UserInfoResponse> GetCurrentUserAsync(int userId, CancellationToken ct);
}
