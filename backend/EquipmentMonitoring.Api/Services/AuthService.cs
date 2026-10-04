using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

/// <summary>Validates user credentials against database records and issues JWT tokens.</summary>
public class AuthService(AppDbContext db, ITokenService tokenService) : IAuthService
{
    private const string InvalidCredentialsMessage = "Invalid email or password.";

    public async Task<LoginResponse> LoginAsync(string email, string password, CancellationToken ct)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            throw new UnauthorizedException(InvalidCredentialsMessage);
        }

        var (token, expiresAt) = tokenService.GenerateToken(user);
        return new LoginResponse(token, expiresAt, user.Email, user.DisplayName, user.Role.ToString());
    }

    public async Task<LoginResponse> GetCurrentUserAsync(int userId, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException($"User {userId} was not found.");

        var (token, expiresAt) = tokenService.GenerateToken(user);
        return new LoginResponse(token, expiresAt, user.Email, user.DisplayName, user.Role.ToString());
    }
}
