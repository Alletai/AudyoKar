using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Models;

public class Funcionario
{
    public int FuncionarioId { get; set; }
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Pessoa ?Pessoa {get; set;}
    public OrdemServ ?OrdemServ {get; set;}
    public string ?Especialidade {get; set;}
}