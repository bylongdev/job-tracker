namespace server.Services;

public interface IJobAdService
{
  Task<string> CreateJobAdAsync(string rawText);
  Task ProcessJobAdAsync(string rawText);
}