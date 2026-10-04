namespace EquipmentMonitoring.Api.Services;

public static class CacheKeys
{
    public const string EquipmentList = "equipment:list";
    public const string DashboardSummary = "dashboard:summary";

    public static string EquipmentById(int id) => $"equipment:{id}";
}
