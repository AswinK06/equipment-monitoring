using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

public interface IRealtimeNotifier
{
    Task ReadingsReceivedAsync(ReadingsBroadcast message);

    Task AlertTriggeredAsync(AlertDto alert);

    Task AlertUpdatedAsync(AlertDto alert);
}
