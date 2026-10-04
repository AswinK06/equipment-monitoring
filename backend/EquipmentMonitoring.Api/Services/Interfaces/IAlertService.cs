using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Services.Interfaces;

/// <summary>Alert management operations.</summary>
public interface IAlertService
{
    /// <summary>Lists alerts, optionally filtered by active status or equipment ID.</summary>
    Task<IReadOnlyList<AlertDto>> ListAsync(bool activeOnly, int? equipmentId, CancellationToken ct);

    /// <summary>Sets alert status (Acknowledged or Resolved).</summary>
    Task<AlertDto> SetStatusAsync(int id, AlertStatus target, CancellationToken ct);
}
