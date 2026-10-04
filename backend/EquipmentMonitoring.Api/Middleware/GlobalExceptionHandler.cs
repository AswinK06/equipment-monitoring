using EquipmentMonitoring.Api.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EquipmentMonitoring.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> log) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (code, title) = ex switch
        {
            UnauthorizedException => (401, "Unauthorized"),
            NotFoundException => (404, "Not found"),
            ConflictException => (409, "Conflict"),
            BadRequestException => (400, "Bad request"),
            _ => (500, "Unexpected error"),
        };

        if (code == 500)
        {
            log.LogError(ex, "Unhandled exception");
        }

        ctx.Response.StatusCode = code;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = code,
            Title = title,
            Detail = code == 500 ? "An unexpected error occurred." : ex.Message,
        }, ct);

        return true;
    }
}
