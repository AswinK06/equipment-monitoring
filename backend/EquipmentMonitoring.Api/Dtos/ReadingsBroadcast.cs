namespace EquipmentMonitoring.Api.Dtos;

public record ReadingsBroadcast(
    int EquipmentId,
    DateTime Timestamp,
    IReadOnlyList<ReadingBroadcastItem> Readings
);
