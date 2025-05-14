using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AudyoKar.Models
{
    public class Funcionario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; }

        [Required]
        [StringLength(20)]
        public string Cargo { get; set; } // "Admin" or "Operacional"

        public ICollection<Agendamento> Agendamentos { get; set; }
        public ICollection<OrdemDeServico> OrdensDeServico { get; set; }
    }
}