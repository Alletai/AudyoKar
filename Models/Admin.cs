namespace AudyoKar.Models;

public class Admin
{
    public int AdminId { get; set; }
    public Pessoa ?Pessoa {get; set;}
    public string ?Especialidade {get; set;}
}