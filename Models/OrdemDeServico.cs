
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AudyoKar.Models
{
    public class OrdemDeServico
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DataServico { get; set; }

        [Required]
        public int ClienteId { get; set; }

        [Required]
        public Cliente Cliente { get; set; }

        [Required]
        public string ServicoRealizado { get; set; }

        [Required]
        public int FuncionarioId { get; set; }

        [Required]
        public Funcionario Funcionario { get; set; }

        public string PeçasUtilizadas { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Valor { get; set; }

        public int? AgendamentoId { get; set; } 
        public Agendamento Agendamento { get; set; } 

        
    }
}