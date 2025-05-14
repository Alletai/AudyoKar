using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AudyoKar.Models;

public class Cliente
{
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; }

        [Required]
        [StringLength(8)]
        public string Placa { get; set; }

        [Required]
        [StringLength(50)]
        public string Modelo { get; set; }

        [Required]
        public int Ano { get; set; }

        public ICollection<Agendamento> Agendamentos { get; set; }

        public ICollection<OrdemDeServico> OrdensDeServico { get; set; }
}