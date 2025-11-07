using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace StockPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TickersController : ControllerBase
{
    private readonly string _filePath = Path.Combine("data", "tickers.csv");

    [HttpGet]
    public IActionResult GetAllTickers()
    {
        if (!System.IO.File.Exists(_filePath))
            return NotFound(new { error = "tickers.csv not found" });

        var csv = System.IO.File.ReadAllText(_filePath, Encoding.UTF8);
        return Content(csv, "text/csv");
    }
}