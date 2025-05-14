using AudyoKar.Models;
using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Data
{
    public class AudyoKarContext : DbContext
    {
        public AudyoKarContext(DbContextOptions<AudyoKarContext> options) : base(options) { }

         public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Agendamento> Agendamentos { get; set; }
        public DbSet<OrdemDeServico> OrdensDeServico { get; set; }
        public DbSet<Funcionario> Funcionarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
    modelBuilder.Entity<Agendamento>()
        .HasOne(a => a.Cliente)
        .WithMany(c => c.Agendamentos)
        .HasForeignKey(a => a.ClienteId)
        .OnDelete(DeleteBehavior.NoAction);

    // Configuração de relacionamento entre Agendamento e OrdemDeServico
    modelBuilder.Entity<OrdemDeServico>()
        .HasOne(os => os.Agendamento)
        .WithOne(a => a.OrdemDeServico)
        .HasForeignKey<OrdemDeServico>(os => os.AgendamentoId)
        .OnDelete(DeleteBehavior.Restrict);

    // Configuração de relacionamento entre Funcionario e Agendamentos
    modelBuilder.Entity<Funcionario>()
        .HasMany(f => f.Agendamentos)
        .WithOne(a => a.Funcionario)
        .HasForeignKey(a => a.FuncionarioId)
        .OnDelete(DeleteBehavior.Restrict);

    // Configuração de relacionamento entre Cliente e OrdensDeServico
    modelBuilder.Entity<OrdemDeServico>()
        .HasOne(os => os.Cliente)
        .WithMany(c => c.OrdensDeServico)
        .HasForeignKey(os => os.ClienteId)
        .OnDelete(DeleteBehavior.Cascade);

    // Configuração de relacionamento entre Funcionario e OrdensDeServico
    modelBuilder.Entity<OrdemDeServico>()
        .HasOne(os => os.Funcionario)
        .WithMany(f => f.OrdensDeServico)
        .HasForeignKey(os => os.FuncionarioId)
        .OnDelete(DeleteBehavior.Cascade);

    // Configuração de tipo de coluna para Valor
    modelBuilder.Entity<OrdemDeServico>()
        .Property(os => os.Valor)
        .HasColumnType("decimal(18, 2)");
        }
    }
}