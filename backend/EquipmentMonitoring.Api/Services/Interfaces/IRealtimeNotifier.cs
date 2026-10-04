using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Services.Interfaces;

/// <summary>Keeps services independent of SignalR; swap the implementation to change transport.</summary>
public interface IRealtimeNotifier
{
    /// <summary>Broadcasts newly received readings to connected clients.</summary>
    Task ReadingsReceivedAsync(ReadingsBroadcast message);

    /// <summary>Broadcasts a newly triggered alert to connected clients.</summary>
    Task AlertTriggeredAsync(AlertDto alert);

    /// <summary>Broadcasts an updated alert status to connected clients.</summary>
    Task AlertUpdatedAsync(AlertDto alert);
}
