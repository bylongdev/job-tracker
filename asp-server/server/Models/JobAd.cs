namespace server.Models;

public class JobAd
{
  public Guid Id { get; set; }
  public string RawText { get; set; } = string.Empty;
  public DateTime CreatedAtUTC { get; set; }
}