using EquipmentMonitoring.Api.Mqtt;
using Xunit;

namespace EquipmentMonitoring.Tests;

public class MqttMessageParserTests
{
    [Fact]
    public void TryParse_ValidMessage_ReturnsTrue_AndParsesPayload()
    {
        var topic = "equipment/42/readings";
        var payload = """
        {
            "timestamp": "2026-10-04T12:00:00Z",
            "readings": [
                { "metric": "temperature", "value": 75.5, "unit": "°C" },
                { "metric": "vibration", "value": 3.2, "unit": "mm/s" }
            ]
        }
        """;

        var result = MqttMessageParser.TryParse(topic, payload, out var equipmentId, out var request);

        Assert.True(result);
        Assert.Equal(42, equipmentId);
        Assert.NotNull(request);
        Assert.Equal(2, request.Readings.Count);
        Assert.Equal("temperature", request.Readings[0].Metric);
        Assert.Equal(75.5, request.Readings[0].Value);
        Assert.Equal("°C", request.Readings[0].Unit);
    }

    [Theory]
    [InlineData("equipment/42/status")]
    [InlineData("devices/42/readings")]
    [InlineData("equipment/abc/readings")]
    [InlineData("equipment/42/readings/extra")]
    [InlineData("equipment/readings")]
    [InlineData("")]
    [InlineData(null)]
    public void TryParse_WrongTopic_ReturnsFalse(string? topic)
    {
        var payload = """
        {
            "readings": [
                { "metric": "temperature", "value": 75.5 }
            ]
        }
        """;

        var result = MqttMessageParser.TryParse(topic!, payload, out var equipmentId, out var request);

        Assert.False(result);
        Assert.Equal(0, equipmentId);
        Assert.Null(request);
    }

    [Theory]
    [InlineData("{ not valid json")]
    [InlineData("plain text")]
    [InlineData("")]
    [InlineData(null)]
    public void TryParse_MalformedJson_ReturnsFalse(string? payload)
    {
        var topic = "equipment/1/readings";

        var result = MqttMessageParser.TryParse(topic, payload!, out var equipmentId, out var request);

        Assert.False(result);
        Assert.Equal(0, equipmentId);
        Assert.Null(request);
    }

    [Theory]
    [InlineData("""{ "readings": [] }""")]
    [InlineData("""{ "readings": [{ "metric": "", "value": 50 }] }""")]
    [InlineData("""{ "readings": [{ "metric": "   ", "value": 50 }] }""")]
    [InlineData("""{ "readings": [{ "metric": "temperature", "value": null }] }""")]
    [InlineData("""{ "timestamp": "2026-10-04T12:00:00Z" }""")]
    public void TryParse_EmptyOrInvalidReadings_ReturnsFalse(string payload)
    {
        var topic = "equipment/1/readings";

        var result = MqttMessageParser.TryParse(topic, payload, out var equipmentId, out var request);

        Assert.False(result);
        Assert.Equal(0, equipmentId);
        Assert.Null(request);
    }
}
