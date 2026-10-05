using EquipmentMonitoring.Api.Constants;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EquipmentMonitoring.Api.Controllers;

[ApiController, Route("api/equipment"), Authorize]
public class EquipmentController(
    IEquipmentService equipment,
    IReadingQueryService readingQuery,
    IReadingIngestionService readingIngestion,
    IAlertService alerts
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EquipmentDto>>> List(CancellationToken ct) =>
        Ok(await equipment.ListAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipmentDto>> Get(int id, CancellationToken ct) =>
        Ok(await equipment.GetAsync(id, ct));

    [HttpPost, Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<EquipmentDto>> Create(EquipmentRequest request, CancellationToken ct)
    {
        var created = await equipment.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<EquipmentDto>> Update(int id, EquipmentRequest request, CancellationToken ct) =>
        Ok(await equipment.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<DeleteEquipmentResponse>> Delete(int id, CancellationToken ct)
    {
        var result = await equipment.DeleteAsync(id, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}/readings")]
    public async Task<ActionResult<IReadOnlyList<ReadingDto>>> History(
        int id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? metric,
        [FromQuery] int limit = 200,
        CancellationToken ct = default
    ) => Ok(await readingQuery.HistoryAsync(id, from, to, metric, limit, ct));

    [HttpPost("{id:int}/readings"), Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<IngestResult>> Ingest(int id, IngestRequest request, CancellationToken ct) =>
        Accepted(await readingIngestion.IngestAsync(id, request, ct));

    [HttpGet("{id:int}/alerts")]
    public async Task<ActionResult<IReadOnlyList<AlertDto>>> AlertHistory(int id, CancellationToken ct) =>
        Ok(await alerts.ListAsync(false, id, ct));
}
