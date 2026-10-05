using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Models;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class AuthService(AppDbContext db, ITokenService tokenService) : IAuthService
{
    private const string InvalidCredentialsMessage = "Invalid email or password.";

    public async Task<LoginResponse> LoginAsync(string email, string password, CancellationToken ct)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            throw new UnauthorizedException(InvalidCredentialsMessage);
        }

        return BuildLoginResponse(user);
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var exists = await db.Users.AnyAsync(u => u.Email == normalizedEmail, ct);
        if (exists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Viewer,
        };

        db.Users.Add(user);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        return BuildLoginResponse(user);
    }

    public async Task<UserInfoResponse> GetCurrentUserAsync(int userId, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException($"User {userId} was not found.");

        return new UserInfoResponse(user.Email, user.DisplayName, user.Role.ToString());
    }

    public async Task<LogoutResponse> LogoutAsync(int userId, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException($"User {userId} was not found.");

        return new LogoutResponse($"User '{user.Email}' logged out successfully.");
    }

    private LoginResponse BuildLoginResponse(User user)
    {
        var (token, expiresAt) = tokenService.GenerateToken(user);
        return new LoginResponse(token, expiresAt, user.Email, user.DisplayName, user.Role.ToString());
    }
}
