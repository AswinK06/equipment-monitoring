using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Services;
using Microsoft.AspNetCore.SignalR;

namespace EquipmentMonitoring.Api.Hubs;

/// <summary>Server → client only. Events: ReadingsReceived, AlertTriggered, AlertUpdated.</summary>
public class EquipmentHub : Hub { }

public class SignalRNotifier(IHubContext<EquipmentHub> hub) : IRealtimeNotifier
{
    public Task ReadingsReceivedAsync(ReadingsBroadcast m) => hub.Clients.All.SendAsync("ReadingsReceived", m);
    public Task AlertTriggeredAsync(AlertDto a) => hub.Clients.All.SendAsync("AlertTriggered", a);
    public Task AlertUpdatedAsync(AlertDto a) => hub.Clients.All.SendAsync("AlertUpdated", a);
}
