using System.Security.Claims;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EquipmentMonitoring.Api.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var response = await authService.LoginAsync(request.Email, request.Password, ct);
        return Ok(response);
    }

    [HttpGet("me"), Authorize]
    public async Task<ActionResult<LoginResponse>> Me(CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(sub) || !int.TryParse(sub, out var userId))
        {
            throw new UnauthorizedException("Invalid token claims.");
        }

        var user = await authService.GetCurrentUserAsync(userId, ct);
        return Ok(user);
    }
}
