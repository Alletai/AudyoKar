using System.Reflection.Metadata;

namespace AudyoKar.Models;

public class Pessoa 
{
    public int PessoaId { get; set; }
    public string ?Nome {get; set;}
    public string ?Sobrenome {get; set;}
    public string ?Telefone {get; set;}
    public string ?Email {get; set;}
    public string ?Cpf {get; set;}
    public string ?Endereco {get; set;}
}
