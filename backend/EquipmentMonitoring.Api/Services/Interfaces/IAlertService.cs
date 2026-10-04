using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Enums;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IAlertService
{
    Task<IReadOnlyList<AlertDto>> ListAsync(bool activeOnly, int? equipmentId, CancellationToken ct);

    Task<AlertDto> SetStatusAsync(int id, AlertStatus target, CancellationToken ct);
}
