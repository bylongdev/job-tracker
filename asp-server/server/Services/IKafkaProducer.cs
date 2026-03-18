namespace server.Services;

public interface IKafkaProducer
{
  Task ProduceAsync(string topic, string message);
}