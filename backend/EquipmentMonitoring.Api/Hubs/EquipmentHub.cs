using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace EquipmentMonitoring.Api.Hubs;

/// <summary>Server → client SignalR hub for equipment updates.</summary>
[Authorize]
public class EquipmentHub : Hub { }
