using System.Text.Json;
using EquipmentMonitoring.Api.Dtos;

namespace EquipmentMonitoring.Api.Mqtt;

public class MqttMessageParser
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public static bool TryParse(string topic, string payload, out int equipmentId, out IngestRequest? request)
    {
        equipmentId = 0;
        request = null;

        if (string.IsNullOrWhiteSpace(topic) || string.IsNullOrWhiteSpace(payload))
        {
            return false;
        }

        var parts = topic.Split('/');
        if (parts.Length != 3 || parts[0] != "equipment" || parts[2] != "readings" || !int.TryParse(parts[1], out var parsedId))
        {
            return false;
        }

        try
        {
            var parsedRequest = JsonSerializer.Deserialize<IngestRequest>(payload, JsonOptions);
            if (parsedRequest is null || parsedRequest.Readings is null || parsedRequest.Readings.Count == 0)
            {
                return false;
            }

            if (parsedRequest.Readings.Any(r => r.Value is null || string.IsNullOrWhiteSpace(r.Metric)))
            {
                return false;
            }

            equipmentId = parsedId;
            request = parsedRequest;
            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
