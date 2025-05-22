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
            var list = await _context.Agendamentos
                .Include(a => a.Cliente)
                .OrderBy(a => a.DataAgendada)
                .ToListAsync();

            var dtos = list.Select(a => new AgendamentoDto
            {
                Id = a.Id,
                Nome = a.Cliente.Nome,
                Problema = a.Problema,
                DataAgendada = a.DataAgendada,
                Status = a.Status
            }).ToList();

            return Ok(dtos);
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
                Status = agendamento.Status
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
    }

    // DTO simples para não vazar navegações EF
    public class AgendamentoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Problema { get; set; }
        public DateTime DataAgendada { get; set; }
        public string Status { get; set; }
    }
}
