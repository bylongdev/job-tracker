using System.Text.Json;

namespace server.Services;

public class JobAdService : IJobAdService
{
  private readonly ILogger<JobAdService> _logger;
  private readonly IKafkaProducer _kafkaProducer;
  public JobAdService(ILogger<JobAdService> logger, IKafkaProducer kafkaProducer)
  {
    _logger = logger;
    _kafkaProducer = kafkaProducer;
  }

  public async Task<string> CreateJobAdAsync(string rawText)
  {

    try
    {
      // Simulate an error for demonstration purposes
      if (string.IsNullOrWhiteSpace(rawText))
      {
        throw new ArgumentException("Raw text cannot be empty.");
      }


      return $"Job ad saved successfully. Length: {rawText.Length}";
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error saving job ad");

      return $"Error saving job ad: {ex.Message}";
    }
  }

  public async Task ProcessJobAdAsync(string rawText)
  {
    if (string.IsNullOrWhiteSpace(rawText))
    {
      _logger.LogWarning("Received empty job ad text. Skipping processing.");
      throw new ArgumentException("Raw text cannot be empty.");
    }

    _logger.LogInformation("Processing job ad with length {length}", rawText.Length);

    var message = new JobAdMessage { Message = rawText, CreatedAt = DateTime.UtcNow };

    var json = JsonSerializer.Serialize(message);

    await _kafkaProducer.ProduceAsync("jobads", json);

    _logger.LogInformation("Job ad message produced to Kafka topic 'jobads'");
  }

}