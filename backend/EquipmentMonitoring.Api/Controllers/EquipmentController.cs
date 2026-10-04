using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EquipmentMonitoring.Api.Controllers;

[ApiController, Route("api/equipment")]
public class EquipmentController(
    IEquipmentService equipment,
    IReadingService readings,
    IAlertService alerts
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EquipmentDto>>> List(CancellationToken ct) =>
        Ok(await equipment.ListAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipmentDto>> Get(int id, CancellationToken ct) =>
        Ok(await equipment.GetAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<EquipmentDto>> Create(EquipmentRequest request, CancellationToken ct)
    {
        var created = await equipment.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EquipmentDto>> Update(int id, EquipmentRequest request, CancellationToken ct) =>
        Ok(await equipment.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await equipment.DeleteAsync(id, ct);
        return NoContent();
    }

    /// <summary>Historical readings, oldest first. Filter with ?from=&amp;to= (ISO 8601), ?metric=, ?limit= (default 200, max 5000).</summary>
    [HttpGet("{id:int}/readings")]
    public async Task<ActionResult<IReadOnlyList<ReadingDto>>> History(
        int id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? metric,
        [FromQuery] int limit = 200,
        CancellationToken ct = default
    ) => Ok(await readings.HistoryAsync(id, from, to, metric, limit, ct));

    [HttpPost("{id:int}/readings")]
    public async Task<ActionResult<IngestResult>> Ingest(int id, IngestRequest request, CancellationToken ct) =>
        Accepted(await readings.IngestAsync(id, request, ct));

    [HttpGet("{id:int}/alerts")]
    public async Task<ActionResult<IReadOnlyList<AlertDto>>> AlertHistory(int id, CancellationToken ct) =>
        Ok(await alerts.ListAsync(false, id, ct));
}
