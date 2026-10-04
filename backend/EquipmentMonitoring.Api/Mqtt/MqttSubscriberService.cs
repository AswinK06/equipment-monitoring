using System.Text.Json;
using EquipmentMonitoring.Api.Dtos;
using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.Extensions.Options;
using MQTTnet;
using MQTTnet.Client;

namespace EquipmentMonitoring.Api.Mqtt;

/// <summary>
/// Subscribes to equipment/{id}/readings and hands each message to the same IReadingService the REST endpoint uses,
/// so MQTT and HTTP ingestion share one persistence + alert + broadcast path. Reconnects every 5s if the broker drops.
/// </summary>
public class MqttSubscriberService(
    IOptions<MqttOptions> options,
    IServiceScopeFactory scopes,
    ILogger<MqttSubscriberService> log
) : BackgroundService
{
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var o = options.Value;
        var client = new MqttFactory().CreateMqttClient();
        client.ApplicationMessageReceivedAsync += e => HandleAsync(e, ct);

        var connect = new MqttClientOptionsBuilder()
            .WithTcpServer(o.Host, o.Port)
            .WithClientId($"equipment-api-{Guid.NewGuid():N}")
            .WithCleanSession()
            .Build();

        while (!ct.IsCancellationRequested)
        {
            try
            {
                if (!client.IsConnected)
                {
                    await client.ConnectAsync(connect, ct);
                    await client.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(o.Topic).Build(), ct);
                    log.LogInformation("MQTT connected to {Host}:{Port}, subscribed to {Topic}", o.Host, o.Port, o.Topic);
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                log.LogWarning("MQTT connection failed ({Message}); retrying in 5s", ex.Message);
            }

            await Task.Delay(TimeSpan.FromSeconds(5), ct);
        }
    }

    private async Task HandleAsync(MqttApplicationMessageReceivedEventArgs e, CancellationToken ct)
    {
        try
        {
            var parts = e.ApplicationMessage.Topic.Split('/');
            if (parts.Length != 3 || !int.TryParse(parts[1], out var equipmentId))
            {
                log.LogWarning("Ignoring message on unexpected topic {Topic}", e.ApplicationMessage.Topic);
                return;
            }

            var payloadString = e.ApplicationMessage.ConvertPayloadToString();
            var request = JsonSerializer.Deserialize<IngestRequest>(payloadString, Json);
            if (request is null || request.Readings.Count == 0 || request.Readings.Any(r => r.Value is null || string.IsNullOrWhiteSpace(r.Metric)))
            {
                log.LogWarning("Ignoring invalid payload on {Topic}", e.ApplicationMessage.Topic);
                return;
            }

            using var scope = scopes.CreateScope();
            var readingService = scope.ServiceProvider.GetRequiredService<IReadingService>();
            await readingService.IngestAsync(equipmentId, request, ct);
        }
        catch (NotFoundException ex)
        {
            log.LogWarning("{Message}", ex.Message);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Failed to process MQTT message");
        }
    }
}
