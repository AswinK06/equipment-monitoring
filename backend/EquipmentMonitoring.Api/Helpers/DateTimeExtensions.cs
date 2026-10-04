namespace EquipmentMonitoring.Api.Helpers;

public static class DateTimeExtensions
{
    public static DateTime ToUtc(this DateTime d) => d.Kind switch
    {
        DateTimeKind.Utc => d,
        DateTimeKind.Local => d.ToUniversalTime(),
        _ => DateTime.SpecifyKind(d, DateTimeKind.Utc),
    };
}
