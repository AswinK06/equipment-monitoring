namespace EquipmentMonitoring.Api.Mqtt;

public class MqttOptions
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1883;
    public string Topic { get; set; } = "equipment/+/readings";
}
