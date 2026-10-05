using System.Security.Claims;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EquipmentMonitoring.Api.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var response = await authService.LoginAsync(request.Email, request.Password, ct);
        return Ok(response);
    }

    [HttpPost("register"), AllowAnonymous, EnableRateLimiting("auth")]
    public async Task<ActionResult<LoginResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        var response = await authService.RegisterAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpGet("me"), Authorize]
    public async Task<ActionResult<UserInfoResponse>> Me(CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(sub) || !int.TryParse(sub, out var userId))
        {
            throw new UnauthorizedException("Invalid token claims.");
        }

        var user = await authService.GetCurrentUserAsync(userId, ct);
        return Ok(user);
    }

    [HttpPost("logout"), Authorize]
    public async Task<ActionResult<LogoutResponse>> Logout(CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(sub) || !int.TryParse(sub, out var userId))
        {
            throw new UnauthorizedException("Invalid token claims.");
        }

        var response = await authService.LogoutAsync(userId, ct);
        return Ok(response);
    }
}
