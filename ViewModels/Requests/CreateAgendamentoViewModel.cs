using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;

namespace AudyoKar.ViewModels.Requests;
public class CreateAgendamentoViewModel
{
    [Required, StringLength(100)]
    [Display(Name = "Nome do Cliente")]
    public string Nome { get; set; }

    [Required, StringLength(50)]
    [Display(Name = "Modelo do Carro")]
    public string Modelo { get; set; }

    [Required]
    [Range(1900, 2100)]
    [Display(Name = "Ano do Carro")]
    public int Ano { get; set; }

    [Required, StringLength(8)]
    [Display(Name = "Placa")]
    public string Placa { get; set; }

    [Required, StringLength(500)]
    [Display(Name = "Descreva o Problema")]
    public string Problema { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [Display(Name = "Data Desejada")]
    public DateTime DataAgendada { get; set; }
}