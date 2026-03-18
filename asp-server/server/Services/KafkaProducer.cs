using Confluent.Kafka;

namespace server.Services;

public class KafkaProducer : IKafkaProducer
{
  private readonly IProducer<Null, string> _producer;
  private readonly ILogger<KafkaProducer> _logger;

  public KafkaProducer(ILogger<KafkaProducer> logger)
  {
    _logger = logger;

    var config = new ProducerConfig
    {
      BootstrapServers = "localhost:9092"
    };

    _producer = new ProducerBuilder<Null, string>(config).Build();
  }

  public async Task ProduceAsync(string topic, string message)
  {
    try
    {
      var result = await _producer.ProduceAsync(topic, new Message<Null, string> { Value = message });
      _logger.LogInformation("Message produced to topic {topic} at offset {offset}", topic, result.Offset);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error producing message to topic {topic}", topic);
      throw;
    }
  }
}