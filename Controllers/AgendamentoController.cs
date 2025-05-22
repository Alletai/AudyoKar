using AudyoKar.Data;
using AudyoKar.Models;
using AudyoKar.ViewModels.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudyoKar.Controllers;

public class AgendamentoController : Controller
{
    private readonly AudyoKarContext _context;

    public AgendamentoController(AudyoKarContext context)
    {
        _context = context;
    }
    public async Task<IActionResult> Index()
    {
        var agendamentos = await _context.Agendamentos
            .OrderBy(a => a.DataAgendada)
            .ToListAsync();

        return View(agendamentos);
    }

    // GET: /Agendamento/Create
    public IActionResult Create()
    {
        return View(new CreateAgendamentoViewModel());
    }

    // POST: /Agendamento/Create
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateAgendamentoViewModel vm)
    {
        if (!ModelState.IsValid)
            return View(vm);

        // find-or-create Cliente
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Placa == vm.Placa);

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

        // cria Agendamento
        var ag = new Agendamento
        {
            ClienteId = cliente.Id,
            Problema = vm.Problema,
            DataAgendada = vm.DataAgendada,
            Status = "Aguardando"
        };
        _context.Agendamentos.Add(ag);
        await _context.SaveChangesAsync();

        return RedirectToAction(nameof(Index));

    }

}