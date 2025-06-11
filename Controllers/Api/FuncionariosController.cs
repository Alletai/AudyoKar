using AudyoKar.Data;
using AudyoKar.Models;
using AudyoKar.ViewModels.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AudyoKar.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class FuncionariosController : Controller
    {
        private readonly AudyoKarContext _context;

        public FuncionariosController(AudyoKarContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<FuncionarioDto>>> Get()
        {
            try
            {
                var lista = await _context.Funcionarios
                    .OrderBy(f => f.Nome)
                    .ToListAsync();

                var dtos = lista.Select(f => new FuncionarioDto
                {
                    Id = f.Id,
                    Nome = f.Nome ?? string.Empty,
                    Email = f.Email ?? string.Empty,
                    Cargo = f.Cargo ?? string.Empty,
                    Funcao = f.Funcao ?? string.Empty
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<FuncionarioDto>> Post([FromBody] CreateFuncionarioViewModel vm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(vm.Nome))
                    return BadRequest("Nome é obrigatório.");

                if (string.IsNullOrWhiteSpace(vm.Funcao))
                    return BadRequest("Função é obrigatória.");

                if (string.IsNullOrWhiteSpace(vm.Email))
                    return BadRequest("E-mail é obrigatório.");

                if (!new EmailAddressAttribute().IsValid(vm.Email))
                    return BadRequest("E-mail inválido.");

                if (string.IsNullOrWhiteSpace(vm.Senha) || vm.Senha.Length < 6)
                    return BadRequest("Senha deve ter pelo menos 6 caracteres.");

                var emailExistente = await _context.Funcionarios
                    .AnyAsync(f => f.Email.ToLower() == vm.Email.ToLower().Trim());
                if (emailExistente)
                    return BadRequest("Já existe um funcionário com este e-mail.");

                var funcionarioExistente = await _context.Funcionarios
                    .FirstOrDefaultAsync(f => f.Nome.ToLower().Trim() == vm.Nome.ToLower().Trim());
                if (funcionarioExistente != null)
                    return BadRequest("Já existe um funcionário com este nome.");

                var funcionario = new Funcionario
                {
                    Nome = vm.Nome.Trim(),
                    Email = vm.Email.Trim(),
                    Senha = vm.Senha, 
                    Funcao = vm.Funcao.Trim(),
                    Cargo = vm.IsAdmin ? "Admin" : "Operacional"
                };

                _context.Funcionarios.Add(funcionario);
                await _context.SaveChangesAsync();

                var novoDto = new FuncionarioDto
                {
                    Id = funcionario.Id,
                    Nome = funcionario.Nome,
                    Email = funcionario.Email,
                    Cargo = funcionario.Cargo,
                    Funcao = funcionario.Funcao
                };

                return CreatedAtAction(nameof(Get), new { id = funcionario.Id }, novoDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FuncionarioDto>> GetById(int id)
        {
            try
            {
                var funcionario = await _context.Funcionarios.FindAsync(id);

                if (funcionario == null)
                    return NotFound();

                var dto = new FuncionarioDto
                {
                    Id = funcionario.Id,
                    Nome = funcionario.Nome ?? string.Empty,
                    Email = funcionario.Email ?? string.Empty,
                    Cargo = funcionario.Cargo ?? string.Empty,
                    Funcao = funcionario.Funcao ?? string.Empty
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateFuncionarioViewModel vm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(vm.Nome))
                    return BadRequest("Nome é obrigatório.");

                if (string.IsNullOrWhiteSpace(vm.Funcao))
                    return BadRequest("Função é obrigatória.");

                if (string.IsNullOrWhiteSpace(vm.Email))
                    return BadRequest("E-mail é obrigatório.");

                if (!new EmailAddressAttribute().IsValid(vm.Email))
                    return BadRequest("E-mail inválido.");

                var funcionario = await _context.Funcionarios.FindAsync(id);
                if (funcionario == null)
                    return NotFound();

                var emailExistente = await _context.Funcionarios
                    .AnyAsync(f => f.Email.ToLower() == vm.Email.ToLower().Trim() && f.Id != id);
                if (emailExistente)
                    return BadRequest("Já existe outro funcionário com este e-mail.");

                var funcionarioExistente = await _context.Funcionarios
                    .FirstOrDefaultAsync(f => f.Nome.ToLower().Trim() == vm.Nome.ToLower().Trim() && f.Id != id);
                if (funcionarioExistente != null)
                    return BadRequest("Já existe outro funcionário com este nome.");

                funcionario.Nome = vm.Nome.Trim();
                funcionario.Email = vm.Email.Trim();
                funcionario.Funcao = vm.Funcao.Trim();
                funcionario.Cargo = vm.IsAdmin ? "Admin" : "Operacional";

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var funcionario = await _context.Funcionarios.FindAsync(id);

                if (funcionario == null)
                    return NotFound();

                var temAgendamentos = await _context.Agendamentos
                    .AnyAsync(a => a.FuncionarioId == id);

                var temOrdens = await _context.OrdensDeServico
                    .AnyAsync(o => o.FuncionarioId == id);

                if (temAgendamentos || temOrdens)
                {
                    return BadRequest("Não é possível excluir funcionário que possui agendamentos ou ordens de serviço associados.");
                }

                _context.Funcionarios.Remove(funcionario);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginFuncionarioViewModel vm)
{
    if (string.IsNullOrWhiteSpace(vm.Email) || string.IsNullOrWhiteSpace(vm.Senha))
        return BadRequest("Email e senha são obrigatórios");

    var funcionario = await _context.Funcionarios
        .FirstOrDefaultAsync(f => f.Email.ToLower() == vm.Email.ToLower().Trim() && f.Senha == vm.Senha);

    if (funcionario == null)
        return Unauthorized("Credenciais inválidas");

    // Aqui seria ideal devolver um JWT, mas para exemplo simples, devolva um objeto:
    return Ok(new
    {
        id = funcionario.Id,
        nome = funcionario.Nome,
        email = funcionario.Email,
        cargo = funcionario.Cargo,
        funcao = funcionario.Funcao,
        isAdmin = funcionario.Cargo == "Admin"
    });
}

        [HttpGet("debug")]
        public async Task<ActionResult> Debug()
        {
            var funcionarios = await _context.Funcionarios.ToListAsync();

            var debug = funcionarios.Select(f => new
            {
                Id = f.Id,
                Nome = f.Nome,
                Email = f.Email,
                Cargo = f.Cargo,
                Funcao = f.Funcao,
                IsAdmin = f.Cargo == "Admin"
            }).ToList();

            return Ok(debug);
        }
    }

    public class FuncionarioDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Nome é obrigatório")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-mail é obrigatório")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Cargo é obrigatório")]
        public string Cargo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Função é obrigatória")]
        public string Funcao { get; set; } = string.Empty;

        public bool IsAdmin => Cargo?.ToLower() == "admin";
    }
}
