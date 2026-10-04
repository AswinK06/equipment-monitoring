namespace EquipmentMonitoring.Api.Dtos;

public record DashboardSummaryDto(
    int TotalEquipment,
    Dictionary<string, int> CountsByStatus,
    int ActiveAlerts,
    int OpenAlerts,
    int AcknowledgedAlerts
);
