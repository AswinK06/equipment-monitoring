using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EquipmentMonitoring.Api.Controllers;

[ApiController, Route("api/alerts"), Authorize]
public class AlertsController(IAlertService alerts) : ControllerBase
{
    /// <summary>GET /api/alerts?activeOnly=true lists Open + Acknowledged alerts.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AlertDto>>> List(
        [FromQuery] bool activeOnly = false,
        [FromQuery] int? equipmentId = null,
        CancellationToken ct = default
    ) => Ok(await alerts.ListAsync(activeOnly, equipmentId, ct));

    [HttpPatch("{id:int}/acknowledge"), Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<AlertDto>> Acknowledge(int id, CancellationToken ct) =>
        Ok(await alerts.SetStatusAsync(id, AlertStatus.Acknowledged, ct));

    [HttpPatch("{id:int}/resolve"), Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<AlertDto>> Resolve(int id, CancellationToken ct) =>
        Ok(await alerts.SetStatusAsync(id, AlertStatus.Resolved, ct));
}
