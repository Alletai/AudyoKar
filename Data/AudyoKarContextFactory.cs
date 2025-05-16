using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using DotNetEnv;
using AudyoKar.Data;

namespace AudyoKar
{
  public class AudyoKarContextFactory : IDesignTimeDbContextFactory<AudyoKarContext>
  {
    public AudyoKarContext CreateDbContext(string[] args)
    {
      Env.Load();

      var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");

      if (string.IsNullOrWhiteSpace(connectionString))
          throw new InvalidOperationException("A variável de ambiente 'DB_CONNECTION' não está definida.");

      var optionsBuilder = new DbContextOptionsBuilder<AudyoKarContext>();
      optionsBuilder.UseSqlServer(connectionString);

      return new AudyoKarContext(optionsBuilder.Options);
    }
  }
}
