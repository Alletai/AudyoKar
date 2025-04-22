using AudyoKar.Models;
using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Data;

public class DbAudyoKar: DbContext
{
    public DbAudyoKar(DbContextOptions options) : base(options) {}     

    public DbSet<Admin> Admins { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<OrdemServ> OrdemServicos { get; set; }
    public DbSet<Pecas> Pecas { get; set; }
    public DbSet<Pessoa> Pessoas { get; set; }
    public DbSet<Servico> Servicos { get; set; }
    public DbSet<Veiculo> Veiculo { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}