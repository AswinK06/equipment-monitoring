using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Models;
using EquipmentMonitoring.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace EquipmentMonitoring.Tests;

public class AuthTests
{
    private static IConfiguration CreateConfig() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-secret-key-that-is-at-least-32-chars-long",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Jwt:ExpiryMinutes"] = "60",
                ["Seed:AdminPassword"] = "AdminPassword123!",
                ["Seed:ViewerPassword"] = "ViewerPassword123!",
            })
            .Build();

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void TokenService_generates_token_with_role_claim()
    {
        var config = CreateConfig();
        var tokenService = new TokenService(config);
        var user = new User
        {
            Id = 42,
            Email = "admin@sustainabyte.local",
            DisplayName = "Test Admin",
            Role = UserRole.Admin,
        };

        var (token, expiresAt) = tokenService.GenerateToken(user);

        Assert.NotNull(token);
        Assert.True(expiresAt > DateTime.UtcNow);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == "role" || c.Type == ClaimTypes.Role);

        Assert.NotNull(roleClaim);
        Assert.Equal("Admin", roleClaim.Value);
    }

    [Fact]
    public async Task AuthService_login_with_correct_credentials_succeeds()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        db.Users.Add(new User
        {
            Email = "operator@sustainabyte.local",
            DisplayName = "Operator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.Viewer,
        });
        await db.SaveChangesAsync();

        var res = await authService.LoginAsync("operator@sustainabyte.local", "Password123!", default);

        Assert.NotNull(res.AccessToken);
        Assert.Equal("operator@sustainabyte.local", res.Email);
        Assert.Equal("Viewer", res.Role);
    }

    [Fact]
    public async Task AuthService_wrong_password_throws_unauthorized_with_generic_message()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        db.Users.Add(new User
        {
            Email = "operator@sustainabyte.local",
            DisplayName = "Operator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.Viewer,
        });
        await db.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() =>
            authService.LoginAsync("operator@sustainabyte.local", "WrongPassword", default)
        );

        Assert.Equal("Invalid email or password.", ex.Message);
    }

    [Fact]
    public async Task AuthService_unknown_email_throws_unauthorized_with_same_generic_message()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() =>
            authService.LoginAsync("nonexistent@sustainabyte.local", "AnyPassword", default)
        );

        Assert.Equal("Invalid email or password.", ex.Message);
    }

    [Fact]
    public async Task AuthService_GetCurrentUserAsync_returns_user_info_without_token()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        var user = new User
        {
            Email = "operator@sustainabyte.local",
            DisplayName = "Operator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.Viewer,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var res = await authService.GetCurrentUserAsync(user.Id, default);

        Assert.Equal("operator@sustainabyte.local", res.Email);
        Assert.Equal("Operator", res.DisplayName);
        Assert.Equal("Viewer", res.Role);
    }

    [Fact]
    public async Task AuthService_RegisterAsync_registered_user_has_role_Viewer_and_hashed_password()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        var req = new RegisterRequest
        {
            DisplayName = "New Observer",
            Email = "newobserver@sustainabyte.local",
            Password = "Password123!",
        };

        var res = await authService.RegisterAsync(req, default);

        Assert.NotNull(res.AccessToken);
        Assert.Equal("newobserver@sustainabyte.local", res.Email);
        Assert.Equal("New Observer", res.DisplayName);
        Assert.Equal("Viewer", res.Role);

        var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "newobserver@sustainabyte.local");
        Assert.NotNull(dbUser);
        Assert.Equal(UserRole.Viewer, dbUser.Role);
        Assert.NotEqual("Password123!", dbUser.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password123!", dbUser.PasswordHash));
    }

    [Fact]
    public async Task AuthService_RegisterAsync_same_email_different_case_throws_ConflictException()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        db.Users.Add(new User
        {
            Email = "existinguser@sustainabyte.local",
            DisplayName = "Existing User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.Viewer,
        });
        await db.SaveChangesAsync();

        var req = new RegisterRequest
        {
            DisplayName = "Duplicate User",
            Email = "EXISTINGUSER@sustainabyte.local",
            Password = "Password123!",
        };

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            authService.RegisterAsync(req, default)
        );

        Assert.Equal("An account with this email already exists.", ex.Message);
    }

    [Fact]
    public async Task AuthService_RegisterAsync_token_contains_Viewer_role_claim()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        var req = new RegisterRequest
        {
            DisplayName = "Jane Viewer",
            Email = "jane@sustainabyte.local",
            Password = "Password123!",
        };

        var res = await authService.RegisterAsync(req, default);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(res.AccessToken);
        var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == "role" || c.Type == ClaimTypes.Role);

        Assert.NotNull(roleClaim);
        Assert.Equal("Viewer", roleClaim.Value);
    }

    [Fact]
    public async Task AuthService_LogoutAsync_existing_user_returns_success_message()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        var user = new User
        {
            Email = "operator@sustainabyte.local",
            DisplayName = "Operator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = UserRole.Viewer,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var res = await authService.LogoutAsync(user.Id, default);

        Assert.NotNull(res);
        Assert.Contains("operator@sustainabyte.local", res.Message);
        Assert.Contains("logged out successfully", res.Message);
    }

    [Fact]
    public async Task AuthService_LogoutAsync_unknown_user_throws_NotFoundException()
    {
        using var db = CreateDbContext();
        var tokenService = new TokenService(CreateConfig());
        var authService = new AuthService(db, tokenService);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            authService.LogoutAsync(999, default)
        );
    }
}
