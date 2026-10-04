using EquipmentMonitoring.Api.Exceptions;
using EquipmentMonitoring.Api.Services.Interfaces;
using Microsoft.Extensions.Options;
using MQTTnet;
using MQTTnet.Client;

namespace EquipmentMonitoring.Api.Mqtt;

public class MqttSubscriberService(
    IOptions<MqttOptions> options,
    IServiceScopeFactory scopes,
    ILogger<MqttSubscriberService> log
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var o = options.Value;
        using var client = new MqttFactory().CreateMqttClient();
        client.ApplicationMessageReceivedAsync += e =>
        {
            _ = Task.Run(() => HandleAsync(e, ct), ct);
            return Task.CompletedTask;
        };

        var connect = new MqttClientOptionsBuilder()
            .WithTcpServer(o.Host, o.Port)
            .WithClientId($"equipment-api-{Guid.NewGuid():N}")
            .WithCleanSession()
            .Build();

        try
        {
            // Reconnects every 5s if the MQTT broker drops
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
        catch (OperationCanceledException)
        {
            // Host is shutting down
        }
        finally
        {
            if (client.IsConnected)
            {
                try
                {
                    await client.DisconnectAsync(new MqttClientDisconnectOptions(), CancellationToken.None);
                }
                catch
                {
                    // Ignore disconnect failures during host shutdown
                }
            }
        }
    }

    private async Task HandleAsync(MqttApplicationMessageReceivedEventArgs e, CancellationToken ct)
    {
        if (ct.IsCancellationRequested) return;

        try
        {
            var topic = e.ApplicationMessage.Topic;
            var payload = e.ApplicationMessage.ConvertPayloadToString();

            if (!MqttMessageParser.TryParse(topic, payload, out var equipmentId, out var request))
            {
                log.LogWarning("Ignoring invalid MQTT message on {Topic}", topic);
                return;
            }

            if (ct.IsCancellationRequested) return;

            using var scope = scopes.CreateScope();
            var readingService = scope.ServiceProvider.GetRequiredService<IReadingIngestionService>();
            await readingService.IngestAsync(equipmentId, request!, ct);
        }
        catch (OperationCanceledException)
        {
            // Host cancellation in flight
        }
        catch (ObjectDisposedException) when (ct.IsCancellationRequested)
        {
            // Host service provider has been disposed during shutdown
        }
        catch (NotFoundException ex)
        {
            log.LogWarning("{Message}", ex.Message);
        }
        catch (Exception ex)
        {
            if (ct.IsCancellationRequested) return;
            log.LogError(ex, "Failed to process MQTT message");
        }
    }
}
