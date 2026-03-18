using server.Dtos;
using server.Services;
using Microsoft.AspNetCore.Mvc;


namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobAdController : ControllerBase
{
  private readonly IJobAdService _jobAdService;
  private readonly ILogger<JobAdController> _logger;

  public JobAdController(IJobAdService jobAdService, ILogger<JobAdController> logger)
  {
    _jobAdService = jobAdService;
    _logger = logger;
  }

  [HttpPost]
  public IActionResult CreateJobAd([FromBody] CreateJobAdRequest request)
  {
    // Logic to create a job ad
    _jobAdService.CreateJobAdAsync(request.RawText);

    return Ok(new
    {
      message = "Job ad received successfully",
      length = request.RawText.Length
    });
  }

  [HttpPost("process")]
  public async Task<IActionResult> ProcessJobAdAsync([FromBody] CreateJobAdRequest request)
  {
    try
    {
      await _jobAdService.ProcessJobAdAsync(request.RawText);

      return Ok(new
      {
        message = "Job ad received and sent to Kafka successfully",
        length = request.RawText.Length
      });
    }
    catch (ArgumentException ex)
    {
      return BadRequest(new
      {
        message = $"Invalid input: {ex.Message}"
      });
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Unexpected error processing job ad");
      return BadRequest(new
      {
        message = $"Error processing job ad: {ex.Message}"
      });
    }
  }


}
