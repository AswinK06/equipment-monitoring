using EquipmentMonitoring.Api.Data;
using EquipmentMonitoring.Api.Domain;
using EquipmentMonitoring.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Services;

public class EquipmentService(AppDbContext db) : IEquipmentService
{
    public async Task<IReadOnlyList<EquipmentDto>> ListAsync(CancellationToken ct) =>
        (await db.Equipment.AsNoTracking().OrderBy(e => e.Id).ToListAsync(ct)).Select(e => e.ToDto()).ToList();

    public async Task<EquipmentDto> GetAsync(int id, CancellationToken ct) => (await Find(id, ct)).ToDto();

    public async Task<EquipmentDto> CreateAsync(EquipmentRequest r, CancellationToken ct)
    {
        var e = new Equipment();
        Apply(e, r);
        db.Equipment.Add(e);
        await db.SaveChangesAsync(ct);
        return e.ToDto();
    }

    public async Task<EquipmentDto> UpdateAsync(int id, EquipmentRequest r, CancellationToken ct)
    {
        var e = await Find(id, ct);
        Apply(e, r);
        await db.SaveChangesAsync(ct);
        return e.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        db.Equipment.Remove(await Find(id, ct));
        await db.SaveChangesAsync(ct);
    }

    private async Task<Equipment> Find(int id, CancellationToken ct) =>
        await db.Equipment.FirstOrDefaultAsync(e => e.Id == id, ct) ?? throw new NotFoundException($"Equipment {id} was not found.");

    private static void Apply(Equipment e, EquipmentRequest r)
    {
        e.Name = r.Name.Trim(); e.Type = r.Type.Trim(); e.Location = r.Location.Trim();
        e.Status = r.Status!.Value; e.InstalledDate = r.InstalledDate!.Value;
    }
}
