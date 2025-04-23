using System.ComponentModel.DataAnnotations.Schema;

namespace AudyoKar.Models;

public class Veiculo
{
    public int VeiculoId { get; set; }
    [NotMapped]
    public int ClienteId { get; set; }
    public Cliente ?Cliente {get; set;}
    public OrdemServ ?OrdemServ {get; set;}
    public string ?Modelo {get; set;}
    public string ?Placa {get; set;}
    public string ?Cor {get; set;}
    public string ?Ano {get; set;}
    public string ?Particularidade {get; set;}
    public string ?Km {get; set;} 

}