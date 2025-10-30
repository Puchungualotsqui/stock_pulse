using Microsoft.AspNetCore.Mvc;

namespace StockPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyzeController: ControllerBase
{
    private readonly IHttpClientFactory _factory;
    
    public AnalyzeController(IHttpClientFactory factory) => _factory = factory;

    [HttpGet("{symbol}")]
    public async Task<IActionResult> GetAnalysis(string symbol)
    {
        var client = _factory.CreateClient("NlpService");
        var res = await client.GetAsync($"/analyze?symbol={symbol}");
        if (res.IsSuccessStatusCode)
            return StatusCode((int)res.StatusCode, await res.Content.ReadAsStringAsync());
        
        var json = await res.Content.ReadAsStringAsync();
        return Content(json, "application/json");
    }
}