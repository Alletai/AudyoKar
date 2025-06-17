using AudyoKar.Data;
using AudyoKar.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AudyoKar.Controllers.Api
{
    [ApiController]
    [Route("api/ordens-servico")]
    public class OrdemServicoController : ControllerBase
    {
        private readonly AudyoKarContext _context;

        public OrdemServicoController(AudyoKarContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<OrdemServicoDto>>> Get()
        {
            var ordensServico = await _context.OrdensDeServico
                .Include(os => os.Cliente)
                .Include(os => os.Funcionario)
                .Include(os => os.Agendamento)
                .OrderByDescending(os => os.DataServico)
                .ToListAsync();

            var dtos = ordensServico.Select(os => new OrdemServicoDto
            {
                Id = os.Id,
                DataServico = os.DataServico,
                ClienteNome = os.Cliente.Nome,
                ClientePlaca = os.Cliente.Placa,
                ServicoRealizado = os.ServicoRealizado,
                FuncionarioNome = os.Funcionario.Nome,
                PecasUtilizadas = os.PeçasUtilizadas,
                Valor = os.Valor,
                AgendamentoId = os.AgendamentoId
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrdemServicoDto>> GetById(int id)
        {
            var ordemServico = await _context.OrdensDeServico
                .Include(os => os.Cliente)
                .Include(os => os.Funcionario)
                .Include(os => os.Agendamento)
                .FirstOrDefaultAsync(os => os.Id == id);

            if (ordemServico == null)
                return NotFound();

            var dto = new OrdemServicoDto
            {
                Id = ordemServico.Id,
                DataServico = ordemServico.DataServico,
                ClienteNome = ordemServico.Cliente.Nome,
                ClientePlaca = ordemServico.Cliente.Placa,
                ServicoRealizado = ordemServico.ServicoRealizado,
                FuncionarioNome = ordemServico.Funcionario.Nome,
                PecasUtilizadas = ordemServico.PeçasUtilizadas,
                Valor = ordemServico.Valor,
                AgendamentoId = ordemServico.AgendamentoId
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<OrdemServicoDto>> Post([FromBody] CreateOrdemServicoViewModel vm)
        {
            try
            {
                // Validações
                if (vm.ClienteId <= 0)
                    return BadRequest("Cliente é obrigatório.");

                if (vm.FuncionarioId <= 0)
                    return BadRequest("Funcionário é obrigatório.");

                if (string.IsNullOrWhiteSpace(vm.ServicoRealizado))
                    return BadRequest("Descrição do serviço realizado é obrigatória.");

                if (vm.Valor <= 0)
                    return BadRequest("Valor deve ser maior que zero.");

                var cliente = await _context.Clientes.FindAsync(vm.ClienteId);
                if (cliente == null)
                    return BadRequest("Cliente não encontrado.");

                var funcionario = await _context.Funcionarios.FindAsync(vm.FuncionarioId);
                if (funcionario == null)
                    return BadRequest("Funcionário não encontrado.");

                Agendamento? agendamento = null;
                if (vm.AgendamentoId.HasValue)
                {
                    agendamento = await _context.Agendamentos.FindAsync(vm.AgendamentoId.Value);
                    if (agendamento == null)
                        return BadRequest("Agendamento não encontrado.");

                    var ordemExistente = await _context.OrdensDeServico
                        .FirstOrDefaultAsync(os => os.AgendamentoId == vm.AgendamentoId.Value);
                    if (ordemExistente != null)
                        return BadRequest("Já existe uma ordem de serviço para este agendamento.");
                }

                var ordemServico = new OrdemDeServico
                {
                    DataServico = vm.DataServico,
                    ClienteId = vm.ClienteId,
                    ServicoRealizado = vm.ServicoRealizado.Trim(),
                    FuncionarioId = vm.FuncionarioId,
                    PeçasUtilizadas = string.IsNullOrWhiteSpace(vm.PecasUtilizadas) ? null : vm.PecasUtilizadas.Trim(),
                    Valor = vm.Valor,
                    AgendamentoId = vm.AgendamentoId
                };

                _context.OrdensDeServico.Add(ordemServico);
                await _context.SaveChangesAsync();

                await _context.Entry(ordemServico)
                    .Reference(os => os.Cliente)
                    .LoadAsync();
                await _context.Entry(ordemServico)
                    .Reference(os => os.Funcionario)
                    .LoadAsync();

                var novoDto = new OrdemServicoDto
                {
                    Id = ordemServico.Id,
                    DataServico = ordemServico.DataServico,
                    ClienteNome = ordemServico.Cliente.Nome,
                    ClientePlaca = ordemServico.Cliente.Placa,
                    ServicoRealizado = ordemServico.ServicoRealizado,
                    FuncionarioNome = ordemServico.Funcionario.Nome,
                    PecasUtilizadas = ordemServico.PeçasUtilizadas,
                    Valor = ordemServico.Valor,
                    AgendamentoId = ordemServico.AgendamentoId
                };

                return CreatedAtAction(nameof(GetById), new { id = ordemServico.Id }, novoDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CreateOrdemServicoViewModel vm)
        {
            try
            {
                var ordemServico = await _context.OrdensDeServico.FindAsync(id);
                if (ordemServico == null)
                    return NotFound();

                // Validações
                if (string.IsNullOrWhiteSpace(vm.ServicoRealizado))
                    return BadRequest("Descrição do serviço realizado é obrigatória.");

                if (vm.Valor <= 0)
                    return BadRequest("Valor deve ser maior que zero.");

                ordemServico.DataServico = vm.DataServico;
                ordemServico.ServicoRealizado = vm.ServicoRealizado.Trim();
                ordemServico.PeçasUtilizadas = string.IsNullOrWhiteSpace(vm.PecasUtilizadas) ? null : vm.PecasUtilizadas.Trim();
                ordemServico.Valor = vm.Valor;

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
                var ordemServico = await _context.OrdensDeServico.FindAsync(id);
                if (ordemServico == null)
                    return NotFound();

                _context.OrdensDeServico.Remove(ordemServico);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("por-agendamento/{agendamentoId}")]
        public async Task<ActionResult<OrdemServicoDto>> GetByAgendamento(int agendamentoId)
        {
            var ordemServico = await _context.OrdensDeServico
                .Include(os => os.Cliente)
                .Include(os => os.Funcionario)
                .FirstOrDefaultAsync(os => os.AgendamentoId == agendamentoId);

            if (ordemServico == null)
                return NotFound();

            var dto = new OrdemServicoDto
            {
                Id = ordemServico.Id,
                DataServico = ordemServico.DataServico,
                ClienteNome = ordemServico.Cliente.Nome,
                ClientePlaca = ordemServico.Cliente.Placa,
                ServicoRealizado = ordemServico.ServicoRealizado,
                FuncionarioNome = ordemServico.Funcionario.Nome,
                PecasUtilizadas = ordemServico.PeçasUtilizadas,
                Valor = ordemServico.Valor,
                AgendamentoId = ordemServico.AgendamentoId
            };

            return Ok(dto);
        }
    }

    // DTOs e ViewModels
    public class OrdemServicoDto
    {
        public int Id { get; set; }
        public DateTime DataServico { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public string ClientePlaca { get; set; } = string.Empty;
        public string ServicoRealizado { get; set; } = string.Empty;
        public string FuncionarioNome { get; set; } = string.Empty;
        public string? PecasUtilizadas { get; set; }
        public decimal Valor { get; set; }
        public int? AgendamentoId { get; set; }
    }

    public class CreateOrdemServicoViewModel
    {
        [Required]
        public DateTime DataServico { get; set; }

        [Required]
        public int ClienteId { get; set; }

        [Required]
        [StringLength(1000, ErrorMessage = "Descrição do serviço não pode exceder 1000 caracteres")]
        public string ServicoRealizado { get; set; } = string.Empty;

        [Required]
        public int FuncionarioId { get; set; }

        [StringLength(500, ErrorMessage = "Descrição das peças não pode exceder 500 caracteres")]
        public string? PecasUtilizadas { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
        public decimal Valor { get; set; }

        public int? AgendamentoId { get; set; }
    }
}