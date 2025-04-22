namespace AudyoKar.Models;

public class OrdemServ 
{
    public Veiculo ?Veiculo {get; set;}     
    public Funcionario ?Funcionario {get; set;}
    public Cliente ?Cliente {get; set;}
    public Pecas ?Pecas {get; set;}
    public Servico ?Servico {get; set;}
    public float Total {get; set;} 
}