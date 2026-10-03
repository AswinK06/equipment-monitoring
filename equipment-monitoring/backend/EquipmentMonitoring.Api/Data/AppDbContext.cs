using EquipmentMonitoring.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EquipmentMonitoring.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<Reading> Readings => Set<Reading>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Threshold> Thresholds => Set<Threshold>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Equipment>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Type).HasMaxLength(60).IsRequired();
            e.Property(x => x.Location).HasMaxLength(120).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
        });
        b.Entity<Reading>(e =>
        {
            e.Property(x => x.Metric).HasMaxLength(40).IsRequired();
            e.Property(x => x.Unit).HasMaxLength(20);
            e.HasIndex(x => new { x.EquipmentId, x.Timestamp });
            e.HasOne<Equipment>().WithMany(x => x.Readings).HasForeignKey(x => x.EquipmentId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<Alert>(e =>
        {
            e.Property(x => x.Metric).HasMaxLength(40).IsRequired();
            e.Property(x => x.Kind).HasConversion<string>().HasMaxLength(10);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => new { x.EquipmentId, x.Status });
            e.HasOne<Equipment>().WithMany(x => x.Alerts).HasForeignKey(x => x.EquipmentId).OnDelete(DeleteBehavior.Cascade);
        });
        b.Entity<Threshold>(e =>
        {
            e.Property(x => x.Metric).HasMaxLength(40).IsRequired();
            e.HasIndex(x => new { x.EquipmentId, x.Metric }).IsUnique();
            e.HasOne<Equipment>().WithMany().HasForeignKey(x => x.EquipmentId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
