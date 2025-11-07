using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Web;

namespace StockPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyzeController : ControllerBase
{
    private readonly IHttpClientFactory _factory;
    private readonly Dictionary<string, string> _tickerMap;

    public AnalyzeController(IHttpClientFactory factory)
    {
        _factory = factory;

        _tickerMap = System.IO.File.ReadAllLines("data/tickers.csv")
            .Skip(1)
            .Select(line => line.Split(','))
            .Where(parts => parts.Length >= 2)
            .ToDictionary(
                parts => parts[0].Trim().ToUpperInvariant(),
                parts => parts[1].Trim()
            );

    }

    [HttpGet("{symbol}")]
    public async Task<IActionResult> GetAnalysis(string symbol)
    {
        symbol = symbol.ToUpperInvariant();

        if (!_tickerMap.TryGetValue(symbol, out var company))
            return BadRequest(new { error = "Invalid ticker symbol" });

        var encodedCompany = HttpUtility.UrlEncode(company);
        var client = _factory.CreateClient("NlpService");

        var res = await client.GetAsync($"/analyze?company={encodedCompany}");
        var content = await res.Content.ReadAsStringAsync();

        return Content(content, "application/json");
    }
}
