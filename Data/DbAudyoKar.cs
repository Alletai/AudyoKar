using AudyoKar.Models;
using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Data;

public class DbAudyoKar: DbContext
{
    public DbAudyoKar(DbContextOptions options) : base(options) {}     

    public DbSet<Pessoa> Pessoas { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Admin> Admins { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<Pecas> Pecas { get; set; }
    public DbSet<Servico> Servicos { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<OrdemServ> OrdemServicos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configurando o relacionamento um-para-um entre Cliente e OrdemServ
        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.OrdemServ)
            .WithOne(os => os.Cliente)
            .HasForeignKey<OrdemServ>(os => os.ClienteId);

        // Configurando o relacionamento um-para-um entre Cliente e Veiculo
        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.Veiculo)         // Cliente tem um Veiculo
            .WithOne(v => v.Cliente)         // Veiculo tem um Cliente
            .HasForeignKey<Veiculo>(v => v.ClienteId);  // Definindo a chave estrangeira em Veiculo
    }
}