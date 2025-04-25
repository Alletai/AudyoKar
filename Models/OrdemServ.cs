using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Models;
public class OrdemServ 
{
    public int OrdemServId { get; set; }

    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Veiculo ?Veiculo {get; set;}     

    [DeleteBehavior(DeleteBehavior.NoAction)]    
    public Funcionario ?Funcionario {get; set;}
    
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Cliente ?Cliente {get; set;}
    
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Pecas ?Pecas {get; set;}
    
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Servico ?Servico {get; set;}
    public float Total {get; set;} 

    // Chaves Estrangeiras
    public int VeiculoId { get; set; }
    public int FuncionarioId { get; set; }
    public int ClienteId { get; set; }
    public int PecasId { get; set; }
    public int ServicoId { get; set; }
}