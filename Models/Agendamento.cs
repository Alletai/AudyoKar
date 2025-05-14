using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;


namespace AudyoKar.Models
{
    public class Agendamento
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClienteId { get; set; }

        [Required]
        public Cliente Cliente { get; set; }

        [Required]
        public string Problema { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DataAgendada { get; set; }

        public string Status { get; set; } = "Aguardando";

        public int? OrdemDeServicoId { get; set; }
        public OrdemDeServico OrdemDeServico { get; set; }

        public int? FuncionarioId { get; set; }
        public Funcionario Funcionario { get; set; }
    }
}