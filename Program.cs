using AudyoKar.Data;
using Microsoft.EntityFrameworkCore;

DotNetEnv.Env.Load();
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<AudyoKarContext>(options =>
{
    options.UseSqlServer(connectionString);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseRouting();
app.UseAuthorization();

// Serve só os endpoints de API
app.MapControllers();

// NÃO mais o default route do MVC:
// app.MapControllerRoute(
//     name: "default",
//     pattern: "{controller=Agendamento}/{action=Index}/{id?}"
// );

// Qualquer rota não-API cai aqui no index.html do React
app.MapFallbackToFile("index.html");

app.Run();
