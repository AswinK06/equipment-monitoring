using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace EquipmentMonitoring.Api.Hubs;

public class SignalRNotifier(IHubContext<EquipmentHub> hub) : IRealtimeNotifier
{
    public Task ReadingsReceivedAsync(ReadingsBroadcast message) =>
        hub.Clients.All.SendAsync("ReadingsReceived", message);

    public Task AlertTriggeredAsync(AlertDto alert) =>
        hub.Clients.All.SendAsync("AlertTriggered", alert);

    public Task AlertUpdatedAsync(AlertDto alert) =>
        hub.Clients.All.SendAsync("AlertUpdated", alert);
}
