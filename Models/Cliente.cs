using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Models;

public class Cliente 
{
    public int ClienteId { get; set; }
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Pessoa ?Pessoa {get; set;}
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Veiculo ?Veiculo {get; set;}
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public OrdemServ ?OrdemServ {get; set;}
}
