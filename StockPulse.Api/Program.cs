var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpClient("NlpService", client =>
{
    client.BaseAddress = new Uri("http://127.0.0.1:8000"); // internal FastAPI
    client.DefaultRequestHeaders.Add("X-INTERNAL-TOKEN", "super_secret_token"); // optional
});

var app = builder.Build();
app.MapControllers();
app.Run();
