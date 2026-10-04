using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace EquipmentMonitoring.Api.Hubs;

[Authorize]
public class EquipmentHub : Hub { }
