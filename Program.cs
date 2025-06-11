using AudyoKar.Data;
using Microsoft.EntityFrameworkCore;

DotNetEnv.Env.Load();
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");

var builder = WebApplication.CreateBuilder(args);

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


if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseRouting();
app.UseAuthorization();


app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
