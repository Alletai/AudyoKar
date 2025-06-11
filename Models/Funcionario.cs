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
        public string Cargo { get; set; } // "Admin" ou "Operacional"

        [Required]
        [StringLength(50)]
        public string Funcao { get; set; } // "Mecânico", "Eletricista", "Borracheiro", etc.

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
        public string Senha { get; set; }

        public ICollection<Agendamento> Agendamentos { get; set; }
        public ICollection<OrdemDeServico> OrdensDeServico { get; set; }
    }
}
