using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

/// <summary>Authentication and user verification operations.</summary>
public interface IAuthService
{
    /// <summary>Validates user credentials and returns an authenticated JWT session response.</summary>
    Task<LoginResponse> LoginAsync(string email, string password, CancellationToken ct);

    /// <summary>Gets user information by user ID.</summary>
    Task<LoginResponse> GetCurrentUserAsync(int userId, CancellationToken ct);
}
