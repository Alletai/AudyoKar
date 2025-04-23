using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace AudyoKar.Models;

public class OrdemServ 
{
    public int OrdemServId { get; set; }
    [NotMapped]
    public Veiculo ?Veiculo {get; set;}     
    public Funcionario ?Funcionario {get; set;}
    public Cliente ?Cliente {get; set;}
    public Pecas ?Pecas {get; set;}
    public Servico ?Servico {get; set;}
    public float Total {get; set;} 

    // Chaves Estrangeiras
    public int VeiculoId { get; set; }
    public int FuncionarioId { get; set; }
    public int ClienteId { get; set; }
    public int PecasId { get; set; }
    public int ServicoId { get; set; }
}