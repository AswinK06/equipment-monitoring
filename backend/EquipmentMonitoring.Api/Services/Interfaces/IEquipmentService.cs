using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

/// <summary>Equipment management operations.</summary>
public interface IEquipmentService
{
    /// <summary>Lists all equipment records.</summary>
    Task<IReadOnlyList<EquipmentDto>> ListAsync(CancellationToken ct);

    /// <summary>Gets a single equipment record by ID.</summary>
    Task<EquipmentDto> GetAsync(int id, CancellationToken ct);

    /// <summary>Registers a new equipment unit.</summary>
    Task<EquipmentDto> CreateAsync(EquipmentRequest r, CancellationToken ct);

    /// <summary>Updates an existing equipment unit.</summary>
    Task<EquipmentDto> UpdateAsync(int id, EquipmentRequest r, CancellationToken ct);

    /// <summary>Deletes an equipment unit by ID.</summary>
    Task DeleteAsync(int id, CancellationToken ct);
}
