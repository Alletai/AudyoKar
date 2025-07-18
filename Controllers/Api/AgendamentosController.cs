using AudyoKar.Data;
using AudyoKar.Models;
using AudyoKar.ViewModels.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgendamentosController : Controller
    {
        private readonly AudyoKarContext _context;

        public AgendamentosController(AudyoKarContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<List<AgendamentoDto>>> Get()
        {
            var lista = await _context.Agendamentos
                .Include(a => a.Cliente)
                .Include(a => a.Funcionario) 
                .OrderBy(a => a.DataAgendada)
                .ToListAsync();

            var dtos = lista.Select(a => new AgendamentoDto
            {
                Id = a.Id,
                Nome = a.Cliente.Nome,
                Problema = a.Problema,
                DataAgendada = a.DataAgendada,
                Status = a.Status,
                Modelo = a.Cliente.Modelo,
                Ano = a.Cliente.Ano,
                Placa = a.Cliente.Placa,
                FuncionarioResponsavel = a.Funcionario?.Nome,
                ClienteId = a.ClienteId, 
                DataFinalizacao = GetDataFinalizacao(a)
            }).ToList();

            return Ok(dtos);
        }

        private DateTime? GetDataFinalizacao(Agendamento agendamento)
        {
            if (agendamento.Status == "Finalizado")
            {
                return DateTime.Now; 
            }
            return null;
        }

        [HttpPost]
        public async Task<ActionResult<AgendamentoDto>> Post([FromBody] CreateAgendamentoViewModel vm)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Placa == vm.Placa);

            if (cliente == null)
            {
                cliente = new Cliente
                {
                    Nome = vm.Nome,
                    Modelo = vm.Modelo,
                    Ano = vm.Ano,
                    Placa = vm.Placa
                };
                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();
            }

            var agendamento = new Agendamento
            {
                ClienteId = cliente.Id,
                Problema = vm.Problema,
                DataAgendada = vm.DataAgendada,
                Status = "Aguardando"
            };

            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            var novoDto = new AgendamentoDto
            {
                Id = agendamento.Id,
                Nome = cliente.Nome,
                Problema = agendamento.Problema,
                DataAgendada = agendamento.DataAgendada,
                Status = agendamento.Status,
                ClienteId = cliente.Id
            };

            return CreatedAtAction(nameof(Get), new { id = agendamento.Id }, novoDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);
            if (agendamento == null)
                return NotFound();

            _context.Remove(agendamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgendamentoDto>> GetById(int id)
        {
            var ag = await _context.Agendamentos
                .Include(a => a.Cliente)
                .Include(a => a.Funcionario)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (ag == null) return NotFound();

            var dto = new AgendamentoDto
            {
                Id = ag.Id,
                Nome = ag.Cliente.Nome,
                Problema = ag.Problema,
                DataAgendada = ag.DataAgendada,
                Status = ag.Status,
                Modelo = ag.Cliente.Modelo,
                Ano = ag.Cliente.Ano,
                Placa = ag.Cliente.Placa,
                FuncionarioResponsavel = ag.Funcionario?.Nome,
                ClienteId = ag.ClienteId,
                DataFinalizacao = GetDataFinalizacao(ag)
            };
            return Ok(dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAgendamentoViewModel vm)
        {
            var ag = await _context.Agendamentos
                .Include(a => a.Cliente)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (ag == null) return NotFound();

            ag.Problema = vm.Problema;
            ag.DataAgendada = vm.DataAgendada;
            ag.Cliente.Nome = vm.Nome;
            ag.Cliente.Modelo = vm.Modelo;
            ag.Cliente.Ano = vm.Ano;
            ag.Cliente.Placa = vm.Placa;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<AgendamentoDto>>> Search([FromQuery] string nome, [FromQuery] string placa)
        {
            if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(placa))
                return BadRequest("Nome e placa são obrigatórios.");

            var cliente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Nome == nome && c.Placa == placa);
            if (cliente == null)
                return NotFound("Cliente não encontrado.");

            var ags = await _context.Agendamentos
                .Where(a => a.ClienteId == cliente.Id)
                .Include(a => a.Cliente)
                .Include(a => a.Funcionario)
                .OrderBy(a => a.DataAgendada)
                .ToListAsync();

            var dtos = ags.Select(a => new AgendamentoDto
            {
                Id = a.Id,
                Nome = a.Cliente.Nome,
                Problema = a.Problema,
                DataAgendada = a.DataAgendada,
                Status = a.Status,
                Modelo = a.Cliente.Modelo,
                Ano = a.Cliente.Ano,
                Placa = a.Cliente.Placa,
                FuncionarioResponsavel = a.Funcionario?.Nome,
                ClienteId = a.ClienteId,
                DataFinalizacao = GetDataFinalizacao(a)
            }).ToList();

            return Ok(dtos);
        }
        
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> AvancarStatus(int id, [FromBody] AvancarStatusViewModel vm)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);
            if (agendamento == null)
                return NotFound();

            switch (agendamento.Status)
            {
                case "Aguardando":
                    agendamento.Status = "Em atendimento";
                    if (vm.FuncionarioId.HasValue)
                    {
                        var funcionario = await _context.Funcionarios.FindAsync(vm.FuncionarioId.Value);
                        if (funcionario != null)
                        {
                            agendamento.FuncionarioId = vm.FuncionarioId.Value;
                        }
                    }
                    break;
                case "Em atendimento":
                    agendamento.Status = "Finalizado";
                    break;
                default:
                    return BadRequest("Status inválido.");
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class AgendamentoDto
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public string? Problema { get; set; }
        public DateTime DataAgendada { get; set; }
        public string? Status { get; set; }
        public string? Modelo { get; set; }
        public int Ano { get; set; }
        public string? Placa { get; set; }
        public string? FuncionarioResponsavel { get; set; }
        public int ClienteId { get; set; } 
        public DateTime? DataFinalizacao { get; set; } 
    }

    public class AvancarStatusViewModel
    {
        public int? FuncionarioId { get; set; }
    }
}