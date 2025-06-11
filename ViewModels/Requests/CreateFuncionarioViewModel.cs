using System.ComponentModel.DataAnnotations;

namespace AudyoKar.ViewModels.Requests
{
    public class CreateFuncionarioViewModel
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Função é obrigatória")]
        public string Funcao { get; set; } = string.Empty;

        public bool IsAdmin { get; set; } = false;

        [Required(ErrorMessage = "E-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        [StringLength(100, ErrorMessage = "E-mail deve ter no máximo 100 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Senha deve ter pelo menos 6 caracteres")]
        public string Senha { get; set; } = string.Empty;
    }
}
