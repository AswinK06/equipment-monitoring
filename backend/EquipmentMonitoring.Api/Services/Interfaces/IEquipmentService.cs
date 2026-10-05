using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IEquipmentService
{
    Task<IReadOnlyList<EquipmentDto>> ListAsync(CancellationToken ct);

    Task<EquipmentDto> GetAsync(int id, CancellationToken ct);

    Task<EquipmentDto> CreateAsync(EquipmentRequest r, CancellationToken ct);

    Task<EquipmentDto> UpdateAsync(int id, EquipmentRequest r, CancellationToken ct);

    Task<DeleteEquipmentResponse> DeleteAsync(int id, CancellationToken ct);
}
