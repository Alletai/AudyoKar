import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// CSS para os modais
const modalStyles = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  .modal-content-large {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 400px;
    max-width: 800px; 
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  
  /* Estilos específicos para o modal de consulta */
  .ordem-servico-card {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    transition: box-shadow 0.3s ease;
  }
  
  .ordem-servico-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .ordem-servico-header {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    padding: 12px 15px;
    border-radius: 6px 6px 0 0;
    margin: -1px -1px 0 -1px;
  }
  
  .valor-destaque {
    font-size: 1.1em;
    font-weight: bold;
    color: #28a745;
  }
  
  .info-box {
    background-color: #f8f9fa;
    border-left: 4px solid #007bff;
    padding: 12px;
    margin: 10px 0;
    border-radius: 0 4px 4px 0;
  }
  
  .problema-box {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 12px;
    margin: 10px 0;
    border-radius: 0 4px 4px 0;
  }
  
  .solucao-box {
    background-color: #d1edff;
    border-left: 4px solid #17a2b8;
    padding: 12px;
    margin: 10px 0;
    border-radius: 0 4px 4px 0;
  }
  
  .pecas-box {
    background-color: #e2e3e5;
    border-left: 4px solid #6c757d;
    padding: 12px;
    margin: 10px 0;
    border-radius: 0 4px 4px 0;
  }

.card-flex {
  display: flex;
  flex-direction: column;
  min-height: 300px; /* Altura mínima para todos os cards */
}

.card-flex .card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Área de conteúdo principal */
.card-content {
  flex-grow: 1;
}

/* Botões sempre na parte inferior */
.card-actions {
  margin-top: auto;
  padding-top: 15px;
}

/* Força as colunas a terem a mesma altura */
.row.d-flex.align-items-stretch > [class^="col"] {
  display: flex;
  flex-direction: column;
}

/* Estilo alternativo para altura fixa */
.card-uniform-height {
  height: 320px;
}

.card-uniform-height .card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-y: auto;
}

.row.d-flex.align-items-stretch > [class^="col"] > .card-flex {
  height: auto;
}

  
  /* Estilo para impressão */
  @media print {
    .modal-overlay {
      position: static !important;
      background: white !important;
    }
    
    .modal-content-large {
      box-shadow: none !important;
      max-width: none !important;
      max-height: none !important;
      overflow: visible !important;
    }
    
    .btn {
      display: none !important;
    }
    
    .modal-header {
      border-bottom: 2px solid #000 !important;
      margin-bottom: 20px !important;
    }
  }
`;

if (!document.getElementById("modal-styles")) {
	const styleSheet = document.createElement("style");
	styleSheet.id = "modal-styles";
	styleSheet.textContent = modalStyles;
	document.head.appendChild(styleSheet);
}

interface Agendamento {
	id: number;
	nome: string;
	problema: string;
	dataAgendada: string;
	status: string;
	modelo?: string;
	ano?: number;
	placa?: string;
	funcionarioResponsavel?: string;
	clienteId?: number;
	dataFinalizacao?: string;
}

interface OrdemServicoForm {
	servicoRealizado: string;
	valor: string;
	pecasUtilizadas: string;
}

interface OrdemServicoCompleta {
	id: number;
	dataServico: string;
	clienteNome: string;
	clientePlaca: string;
	servicoRealizado: string;
	funcionarioNome: string;
	pecasUtilizadas?: string;
	valor: number;
	agendamentoId?: number;
}

const AgendamentoBoard: React.FC = () => {
	const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
	const [loading, setLoading] = useState(false);

	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);

	const [confirmModalOpenIniciar, setConfirmModalOpenIniciar] = useState(false);
	const [confirmModalOpenFinalizar, setConfirmModalOpenFinalizar] =
		useState(false);
	const [idToAdvance, setIdToAdvance] = useState<number | null>(null);

	// Estados para o modal de ordem de serviço
	const [ordemServicoModalOpen, setOrdemServicoModalOpen] = useState(false);
	const [agendamentoSelecionado, setAgendamentoSelecionado] =
		useState<Agendamento | null>(null);
	const [ordemServicoForm, setOrdemServicoForm] = useState<OrdemServicoForm>({
		servicoRealizado: "",
		valor: "",
		pecasUtilizadas: "",
	});
	const [salvandoOrdem, setSalvandoOrdem] = useState(false);
	const [verificandoOrdem, setVerificandoOrdem] = useState(false);

	// Estados para o modal de consulta de ordem de serviço
	const [consultaOrdemModalOpen, setConsultaOrdemModalOpen] = useState(false);
	const [ordemServicoConsulta, setOrdemServicoConsulta] =
		useState<OrdemServicoCompleta | null>(null);
	const [carregandoOrdemConsulta, setCarregandoOrdemConsulta] = useState(false);

	// Estado para controlar quais agendamentos têm ordem de serviço
	const [agendamentosComOrdem, setAgendamentosComOrdem] = useState<Set<number>>(
		new Set()
	);

	const navigate = useNavigate();
	const location = useLocation();

	// Pegando funcionário logado do localStorage
	const funcionarioLogado = JSON.parse(
		localStorage.getItem("funcionarioLogado") || "null"
	);

	// Função para verificar quais agendamentos têm ordem de serviço
	const verificarOrdensServico = async (agendamentos: Agendamento[]) => {
		const agendamentosFinalizados = agendamentos.filter(
			(a) => a.status === "Finalizado"
		);
		const agendamentosComOrdemSet = new Set<number>();

		await Promise.all(
			agendamentosFinalizados.map(async (agendamento) => {
				try {
					const res = await fetch(
						`/api/ordens-servico/por-agendamento/${agendamento.id}`
					);
					if (res.ok) {
						agendamentosComOrdemSet.add(agendamento.id);
					}
				} catch (err) {

				}
			})
		);

		setAgendamentosComOrdem(agendamentosComOrdemSet);
	};

	useEffect(() => {
		setLoading(true);
		fetch("/api/agendamentos")
			.then((res) => {
				if (!res.ok) throw new Error("Falha ao buscar agendamentos");
				return res.json();
			})
			.then(async (data: Agendamento[]) => {
				setAgendamentos(data);
				await verificarOrdensServico(data);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [location.key]);

	const openConfirm = (id: number) => {
		setIdToDelete(id);
		setConfirmModalOpen(true);
	};

	const closeConfirm = () => {
		setConfirmModalOpen(false);
		setIdToDelete(null);
	};

	const confirmDelete = async () => {
		if (idToDelete == null) return;
		try {
			const res = await fetch(`/api/agendamentos/${idToDelete}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Erro ao excluir");
			setAgendamentos((prev) => prev.filter((a) => a.id !== idToDelete));
		} catch (err) {
			console.error(err);
			alert("Não foi possível excluir o agendamento.");
		} finally {
			closeConfirm();
		}
	};

	const handleStatusAdvance = async (id: number) => {
		try {
			const payload = {
				funcionarioId: funcionarioLogado?.id,
			};

			const res = await fetch(`/api/agendamentos/${id}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (res.status === 204) {
				setAgendamentos((prev) =>
					prev.map((a) => {
						if (a.id !== id) return a;
						let novoStatus = "";
						let funcionarioResponsavel = a.funcionarioResponsavel;
						let dataFinalizacao = a.dataFinalizacao;

						if (a.status === "Aguardando") {
							novoStatus = "Em atendimento";
							funcionarioResponsavel = funcionarioLogado?.nome;
						} else if (a.status === "Em atendimento") {
							novoStatus = "Finalizado";
							dataFinalizacao = new Date().toISOString();
						} else {
							novoStatus = a.status;
						}

						return {
							...a,
							status: novoStatus,
							funcionarioResponsavel: funcionarioResponsavel,
							dataFinalizacao: dataFinalizacao,
						};
					})
				);
				closeConfirmAdvance();
			} else if (res.status === 400) {
				const erroTexto = await res.text();
				alert("Não foi possível avançar status: " + erroTexto);
				closeConfirmAdvance();
			} else {
				const responseText = await res.text();
				alert(`Erro inesperado. Status: ${res.status}`);
				console.error("Detalhes do erro:", responseText);
				closeConfirmAdvance();
			}
		} catch (err) {
			alert("Erro ao mudar status. Veja o console.");
			closeConfirmAdvance();
		}
	};

	const openConfirmIniciar = (id: number) => {
		setIdToAdvance(id);
		setConfirmModalOpenIniciar(true);
	};

	const openConfirmFinalizar = (id: number) => {
		setIdToAdvance(id);
		setConfirmModalOpenFinalizar(true);
	};

	const closeConfirmAdvance = () => {
		setConfirmModalOpenIniciar(false);
		setConfirmModalOpenFinalizar(false);
		setIdToAdvance(null);
	};

	// Verificar se já existe ordem de serviço para o agendamento
	const verificarOrdemServicoExistente = async (
		agendamentoId: number
	): Promise<boolean> => {
		try {
			const res = await fetch(
				`/api/ordens-servico/por-agendamento/${agendamentoId}`
			);
			return res.ok; // Se retornar 200, já existe
		} catch (err) {
			return false; // Se der erro 404, não existe
		}
	};

	// Função para buscar ordem de serviço completa
	const buscarOrdemServicoCompleta = async (
		agendamentoId: number
	): Promise<OrdemServicoCompleta | null> => {
		try {
			const res = await fetch(
				`/api/ordens-servico/por-agendamento/${agendamentoId}`
			);
			if (res.ok) {
				const ordem = await res.json();
				return ordem;
			} else if (res.status === 404) {
				return null;
			} else {
				throw new Error(`Erro ${res.status}: ${res.statusText}`);
			}
		} catch (err) {
			console.error("Erro ao buscar ordem de serviço:", err);
			throw err;
		}
	};

	const openOrdemServicoModal = async (agendamento: Agendamento) => {
		setVerificandoOrdem(true);

		const jaExiste = await verificarOrdemServicoExistente(agendamento.id);

		if (jaExiste) {
			alert(
				"Já existe uma ordem de serviço para este agendamento. Você pode visualizá-la na seção de Ordens de Serviço."
			);
			setVerificandoOrdem(false);
			return;
		}

		setAgendamentoSelecionado(agendamento);
		setOrdemServicoForm({
			servicoRealizado: "",
			valor: "",
			pecasUtilizadas: "",
		});
		setOrdemServicoModalOpen(true);
		setVerificandoOrdem(false);
	};

	const closeOrdemServicoModal = () => {
		setOrdemServicoModalOpen(false);
		setAgendamentoSelecionado(null);
		setOrdemServicoForm({
			servicoRealizado: "",
			valor: "",
			pecasUtilizadas: "",
		});
	};

	const openConsultaOrdemModal = async (agendamento: Agendamento) => {
		setCarregandoOrdemConsulta(true);
		setConsultaOrdemModalOpen(true);
		setOrdemServicoConsulta(null); 

		try {
			const ordem = await buscarOrdemServicoCompleta(agendamento.id);
			if (ordem) {
				const ordemCompleta = {
					...ordem,
					agendamento: {
						id: agendamento.id,
						nome: agendamento.nome,
						problema: agendamento.problema,
						dataAgendada: agendamento.dataAgendada,
						modelo: agendamento.modelo,
						ano: agendamento.ano,
						placa: agendamento.placa,
						funcionarioResponsavel: agendamento.funcionarioResponsavel,
						dataFinalizacao: agendamento.dataFinalizacao,
					},
				};
				setOrdemServicoConsulta(ordemCompleta as any);
			} else {
				throw new Error("Ordem de serviço não encontrada");
			}
		} catch (error) {
			console.error("Erro ao carregar ordem de serviço:", error);
			alert("Erro ao carregar ordem de serviço. Tente novamente.");
			setConsultaOrdemModalOpen(false);
		} finally {
			setCarregandoOrdemConsulta(false);
		}
	};

	const closeConsultaOrdemModal = () => {
		setConsultaOrdemModalOpen(false);
		setOrdemServicoConsulta(null);
	};

	const handleOrdemServicoSubmit = async () => {
		if (!agendamentoSelecionado || !funcionarioLogado) return;

		
		if (!ordemServicoForm.servicoRealizado.trim()) {
			alert("Por favor, descreva o serviço realizado.");
			return;
		}

		if (!ordemServicoForm.valor.trim()) {
			alert("Por favor, informe o valor do serviço.");
			return;
		}

		const valorNumerico = parseFloat(
			ordemServicoForm.valor.replace(/[^\d,.-]/g, "").replace(",", ".")
		);
		if (isNaN(valorNumerico) || valorNumerico <= 0) {
			alert("Por favor, informe um valor válido para o serviço.");
			return;
		}

		setSalvandoOrdem(true);

		try {
			const dataServico = agendamentoSelecionado.dataFinalizacao
				? new Date(agendamentoSelecionado.dataFinalizacao)
						.toISOString()
						.split("T")[0]
				: new Date().toISOString().split("T")[0];

			const ordemServicoData = {
				dataServico: dataServico,
				clienteId: agendamentoSelecionado.clienteId,
				servicoRealizado: ordemServicoForm.servicoRealizado.trim(),
				funcionarioId: funcionarioLogado.id,
				pecasUtilizadas: ordemServicoForm.pecasUtilizadas.trim() || null,
				valor: valorNumerico,
				agendamentoId: agendamentoSelecionado.id,
			};

			const res = await fetch("/api/ordens-servico", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(ordemServicoData),
			});

			if (res.ok) {
				const ordemCriada = await res.json();
				alert("Ordem de serviço criada com sucesso!");
				console.log("Ordem de serviço criada:", ordemCriada);

				setAgendamentosComOrdem(
					(prev) => new Set([...prev, agendamentoSelecionado.id])
				);

				closeOrdemServicoModal();
			} else {
				const errorText = await res.text();
				throw new Error(`Erro ao criar ordem de serviço: ${errorText}`);
			}
		} catch (err) {
			console.error("Erro ao criar ordem de serviço:", err);
			alert(
				"Erro ao criar ordem de serviço. Veja o console para mais detalhes."
			);
		} finally {
			setSalvandoOrdem(false);
		}
	};

	const handleInputChange = (field: keyof OrdemServicoForm, value: string) => {
		setOrdemServicoForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const formatarValor = (valor: string) => {
		let valorLimpo = valor.replace(/[^\d,.-]/g, "");

		if (valorLimpo.includes(",")) {
			valorLimpo = valorLimpo.replace(",", ".");
		}

		return valorLimpo;
	};

	const aguardando = agendamentos.filter((a) => a.status === "Aguardando");
	const emAtendimento = agendamentos.filter(
		(a) => a.status === "Em atendimento"
	);
	const finalizados = agendamentos.filter((a) => a.status === "Finalizado");

	return (
		<div className="container mt-4">
			{loading && <p>Carregando agendamentos…</p>}
			<div>
				{/* NAVBAR COM NOME E BOTÃO SAIR */}
				<nav className="navbar navbar-expand-lg navbar-light">
					<div className="container-fluid">
						<Link className="navbar-brand" to="/">
							Oficina AudyoKar
						</Link>
						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarNav"
						>
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="collapse navbar-collapse" id="navbarNav">
							<ul className="navbar-nav">
								<li className="nav-item">
									<Link className="nav-link" to="/">
										Início
									</Link>
								</li>
								{funcionarioLogado?.isAdmin && (
									<li className="nav-item">
										<Link className="nav-link" to="/funcionarios">
											Gerenciamento
										</Link>
									</li>
								)}
								<li className="nav-item">
									<Link className="nav-link" to="/agendamentos">
										Agendamentos
									</Link>
								</li>
							</ul>
							{/* Alinhamento à direita */}
							<div className="ms-auto d-flex align-items-center gap-2">
								{funcionarioLogado && (
									<>
										<span className="navbar-text">
											Olá, {funcionarioLogado.nome}
										</span>
										<button
											className="btn btn-outline-secondary btn-sm"
											onClick={() => {
												localStorage.removeItem("funcionarioLogado");
												window.location.href = "/login-funcionario";
											}}
										>
											Sair
										</button>
									</>
								)}
							</div>
						</div>
					</div>
				</nav>
			</div>

			<div className="row d-flex align-items-stretch">
				{/* Coluna Aguardando */}
				<div className="col-md-4 column-equal-height">
					<div className="bg-warning text-white p-3 mb-4 rounded text-center">
						<h5 className="mb-0">Aguardando ({aguardando.length})</h5>
					</div>
					{aguardando.map((ag) => (
						<div key={ag.id} className="card mb-3 card-flex">
							<div className="card-body">
								<h5 className="card-title">{ag.nome}</h5>
								<p className="mb-1">
									<strong>Problema:</strong> {ag.problema}
								</p>
								<p className="mb-1">
									<strong>Data Agendada:</strong>{" "}
									{new Date(ag.dataAgendada).toLocaleDateString()}
								</p>
								{ag.modelo && (
									<p className="mb-1">
										<strong>Veículo:</strong> {ag.modelo} {ag.ano} - {ag.placa}
									</p>
								)}
								<p className="mb-3">
									<span className="badge bg-warning">Aguardando</span>
								</p>
								<div className="d-flex flex-wrap gap-2">
									<button
										onClick={(e) => {
											e.preventDefault();
											openConfirmIniciar(ag.id);
										}}
										className="btn btn-primary btn-sm"
									>
										Iniciar Atendimento
									</button>
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											openConfirm(ag.id);
										}}
										className="btn btn-danger btn-sm"
									>
										Excluir
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Coluna Em Atendimento */}
				<div className="col-md-4 column-equal-height">
					<div className="bg-primary text-white p-3 mb-4 rounded text-center">
						<h5 className="mb-0">Em Atendimento ({emAtendimento.length})</h5>
					</div>
					{emAtendimento.map((ag) => (
						<div key={ag.id} className="card mb-3 card-flex">
							<div className="card-body">
								<h5 className="card-title">{ag.nome}</h5>
								<p className="mb-1">
									<strong>Problema:</strong> {ag.problema}
								</p>
								<p className="mb-1">
									<strong>Data Agendada:</strong>{" "}
									{new Date(ag.dataAgendada).toLocaleDateString()}
								</p>
								{ag.modelo && (
									<p className="mb-1">
										<strong>Veículo:</strong> {ag.modelo} {ag.ano} - {ag.placa}
									</p>
								)}
								{/* Mostra o funcionário responsável */}
								{ag.funcionarioResponsavel && (
									<p className="mb-1">
										<strong>Responsável:</strong>
										<span className="badge bg-info text-dark ms-1">
											{ag.funcionarioResponsavel}
										</span>
									</p>
								)}
								<p className="mb-3">
									<span className="badge bg-primary">Em Atendimento</span>
								</p>
								<div className="d-flex flex-wrap gap-2">
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											openConfirmFinalizar(ag.id);
										}}
										className="btn btn-success btn-sm"
									>
										Finalizar Atendimento
									</button>
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											openConfirm(ag.id);
										}}
										className="btn btn-danger btn-sm"
									>
										Excluir
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Coluna Finalizados */}
				<div className="col-md-4 column-equal-height">
					<div className="bg-success text-white p-3 mb-4 rounded text-center">
						<h5 className="mb-0">Finalizado ({finalizados.length})</h5>
					</div>
					{finalizados.map((ag) => (
						<div key={ag.id} className="card mb-3 card-flex">
							<div className="card-body">
								<h5 className="card-title">{ag.nome}</h5>
								<p className="mb-1">
									<strong>Problema:</strong> {ag.problema}
								</p>
								<p className="mb-1">
									<strong>Data Agendada:</strong>{" "}
									{new Date(ag.dataAgendada).toLocaleDateString()}
								</p>
								{ag.modelo && (
									<p className="mb-1">
										<strong>Veículo:</strong> {ag.modelo} {ag.ano} - {ag.placa}
									</p>
								)}
								{/* Mostra o funcionário responsável que finalizou */}
								{ag.funcionarioResponsavel && (
									<p className="mb-1">
										<strong>Atendido por:</strong>
										<span className="badge bg-secondary ms-1">
											{ag.funcionarioResponsavel}
										</span>
									</p>
								)}
								{/* Data de finalização */}
								{ag.dataFinalizacao && (
									<p className="mb-1">
										<strong>Finalizado em:</strong>{" "}
										{new Date(ag.dataFinalizacao).toLocaleDateString()}
									</p>
								)}
								<p className="mb-3">
									<span className="badge bg-success">Finalizado</span>
								</p>
								<div className="d-flex flex-wrap gap-2">
									{agendamentosComOrdem.has(ag.id) ? (
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												openConsultaOrdemModal(ag);
											}}
											className="btn btn-info btn-sm"
											title="Consultar Ordem de Serviço"
										>
											Consultar Ordem
										</button>
									) : (
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												openOrdemServicoModal(ag);
											}}
											className="btn btn-warning btn-sm"
											title="Gerar Ordem de Serviço"
											disabled={verificandoOrdem}
										>
											{verificandoOrdem ? "..." : ""} Gerar Ordem
										</button>
									)}
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											openConfirm(ag.id);
										}}
										className="btn btn-danger btn-sm"
									>
										Excluir
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Botão flutuante para novo agendamento */}
			<button
				onClick={() => navigate("/create")}
				className="btn btn-warning btn-circle position-fixed bottom-0 end-0 m-4"
				style={{
					width: "60px",
					height: "60px",
					borderRadius: "50%",
					fontSize: "24px",
					boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
				}}
				title="Adicionar agendamento"
			>
				➕
			</button>

			{/* Modal de confirmação de exclusão */}
			{confirmModalOpen && (
				<div
					className="modal-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeConfirm();
					}}
				>
					<div className="modal-content">
						<h5>Confirmar Exclusão</h5>
						<p>Deseja realmente excluir este agendamento?</p>
						<div className="d-flex justify-content-end gap-2 mt-3">
							<button onClick={closeConfirm} className="btn btn-secondary">
								Cancelar
							</button>
							<button onClick={confirmDelete} className="btn btn-danger">
								Excluir
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal de Confirmação para Iniciar Atendimento */}
			{confirmModalOpenIniciar && (
				<div
					className="modal-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeConfirmAdvance();
					}}
				>
					<div className="modal-content">
						<h5>Iniciar Atendimento</h5>
						<p>Deseja realmente iniciar o atendimento deste agendamento?</p>
						<p className="text-muted">
							<small>
								Você será registrado como responsável por este atendimento.
							</small>
						</p>
						<div className="d-flex justify-content-end gap-2 mt-3">
							<button
								onClick={closeConfirmAdvance}
								className="btn btn-secondary"
							>
								Cancelar
							</button>
							<button
								onClick={() => {
									if (idToAdvance) handleStatusAdvance(idToAdvance);
								}}
								className="btn btn-primary"
							>
								Iniciar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal de Confirmação para Finalizar Atendimento */}
			{confirmModalOpenFinalizar && (
				<div
					className="modal-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeConfirmAdvance();
					}}
				>
					<div className="modal-content">
						<h5>Finalizar Atendimento</h5>
						<p>Deseja realmente finalizar o atendimento deste agendamento?</p>
						<div className="d-flex justify-content-end gap-2 mt-3">
							<button
								onClick={closeConfirmAdvance}
								className="btn btn-secondary"
							>
								Cancelar
							</button>
							<button
								onClick={() => {
									if (idToAdvance) handleStatusAdvance(idToAdvance);
								}}
								className="btn btn-success"
							>
								Finalizar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal para Criar Ordem de Serviço */}
			{ordemServicoModalOpen && agendamentoSelecionado && (
				<div
					className="modal-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeOrdemServicoModal();
					}}
				>
					<div className="modal-content-large">
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h5 className="mb-0">Gerar Ordem de Serviço</h5>
							<button
								type="button"
								className="btn-close"
								onClick={closeOrdemServicoModal}
								disabled={salvandoOrdem}
							></button>
						</div>

						<div className="alert alert-info mb-3">
							<div className="row">
								<div className="col-md-6">
									<strong>Cliente:</strong> {agendamentoSelecionado.nome}
									<br />
									<strong>Problema relatado:</strong>{" "}
									{agendamentoSelecionado.problema}
								</div>
								<div className="col-md-6">
									{agendamentoSelecionado.modelo && (
										<>
											<strong>Veículo:</strong> {agendamentoSelecionado.modelo}{" "}
											{agendamentoSelecionado.ano}
											<br />
											<strong>Placa:</strong> {agendamentoSelecionado.placa}
										</>
									)}
								</div>
							</div>
						</div>

						<form onSubmit={(e) => e.preventDefault()}>
							<div className="mb-3">
								<label htmlFor="servicoRealizado" className="form-label">
									<strong>Serviço Realizado/Solução*</strong>
								</label>
								<textarea
									id="servicoRealizado"
									className="form-control"
									rows={4}
									placeholder="Descreva detalhadamente o serviço realizado e a solução aplicada..."
									value={ordemServicoForm.servicoRealizado}
									onChange={(e) =>
										handleInputChange("servicoRealizado", e.target.value)
									}
									required
								/>
							</div>

							<div className="row">
								<div className="col-md-6">
									<div className="mb-3">
										<label htmlFor="valor" className="form-label">
											<strong>Valor do Serviço (R$)*</strong>
										</label>
										<input
											id="valor"
											type="text"
											className="form-control"
											placeholder="Ex: 150.00 ou 150,00"
											value={ordemServicoForm.valor}
											onChange={(e) =>
												handleInputChange(
													"valor",
													formatarValor(e.target.value)
												)
											}
											required
										/>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">
											<strong>Data do Serviço</strong>
										</label>
										<input
											type="text"
											className="form-control"
											value={
												agendamentoSelecionado.dataFinalizacao
													? new Date(
															agendamentoSelecionado.dataFinalizacao
													  ).toLocaleDateString()
													: new Date().toLocaleDateString()
											}
											disabled
											style={{ backgroundColor: "#f8f9fa" }}
										/>
									</div>
								</div>
							</div>

							<div className="mb-3">
								<label htmlFor="pecasUtilizadas" className="form-label">
									<strong>Peças Utilizadas</strong>
								</label>
								<textarea
									id="pecasUtilizadas"
									className="form-control"
									rows={3}
									placeholder="Liste as peças utilizadas (opcional)..."
									value={ordemServicoForm.pecasUtilizadas}
									onChange={(e) =>
										handleInputChange("pecasUtilizadas", e.target.value)
									}
								/>
							</div>
						</form>

						<div className="d-flex justify-content-end gap-2 mt-4">
							<button
								onClick={closeOrdemServicoModal}
								className="btn btn-secondary"
								disabled={salvandoOrdem}
							>
								Cancelar
							</button>
							<button
								onClick={handleOrdemServicoSubmit}
								className="btn btn-success"
								disabled={salvandoOrdem}
							>
								{salvandoOrdem ? (
									<>
										<span
											className="spinner-border spinner-border-sm me-2"
											role="status"
										></span>
										Salvando...
									</>
								) : (
									"Gerar Ordem de Serviço"
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal para Consultar Ordem de Serviço */}
			{consultaOrdemModalOpen && (
				<div
					className="modal-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) closeConsultaOrdemModal();
					}}
				>
					<div className="modal-content-large">
						<div className="d-flex justify-content-between align-items-center mb-3">
							<h5 className="mb-0">Consultar Ordem de Serviço</h5>
							<button
								type="button"
								className="btn-close"
								onClick={closeConsultaOrdemModal}
							></button>
						</div>

						{carregandoOrdemConsulta ? (
							<div className="text-center py-4">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Carregando...</span>
								</div>
								<p className="mt-2">Carregando ordem de serviço...</p>
							</div>
						) : ordemServicoConsulta ? (
							<div>
								{/* Informações do Cliente e Veículo */}
								<div className="card mb-3">
									<div className="card-header bg-primary text-white">
										<h6 className="mb-0">📋 Informações do Atendimento</h6>
									</div>
									<div className="card-body">
										<div className="row">
											<div className="col-md-6">
												<p className="mb-2">
													<strong>Cliente:</strong>{" "}
													{ordemServicoConsulta.clienteNome}
												</p>
												<p className="mb-2">
													<strong>Placa do Veículo:</strong>{" "}
													{ordemServicoConsulta.clientePlaca}
												</p>
												<p className="mb-2">
													<strong>Data do Serviço:</strong>{" "}
													{new Date(
														ordemServicoConsulta.dataServico
													).toLocaleDateString("pt-BR")}
												</p>
											</div>
											<div className="col-md-6">
												<p className="mb-2">
													<strong>Funcionário Responsável:</strong>{" "}
													{ordemServicoConsulta.funcionarioNome}
												</p>
												<p className="mb-2">
													<strong>Valor Total:</strong>
													<span className="badge bg-success ms-2 fs-6">
														R${" "}
														{ordemServicoConsulta.valor.toLocaleString(
															"pt-BR",
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															}
														)}
													</span>
												</p>
												<p className="mb-2">
													<strong>Ordem de Serviço Nº:</strong>
													<span className="badge bg-secondary ms-2">
														#
														{ordemServicoConsulta.id
															.toString()
															.padStart(4, "0")}
													</span>
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Informações do Agendamento Original */}
								{(ordemServicoConsulta as any).agendamento && (
									<div className="card mb-3">
										<div className="card-header bg-warning text-dark">
											<h6 className="mb-0">📅 Dados do Agendamento Original</h6>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="col-md-6">
													<p className="mb-2">
														<strong>Data Agendada:</strong>{" "}
														{new Date(
															(
																ordemServicoConsulta as any
															).agendamento.dataAgendada
														).toLocaleDateString("pt-BR")}
													</p>
													<p className="mb-2">
														<strong>Problema Relatado:</strong>
													</p>
													<div className="bg-light p-2 rounded">
														<small>
															{
																(ordemServicoConsulta as any).agendamento
																	.problema
															}
														</small>
													</div>
												</div>
												<div className="col-md-6">
													{(ordemServicoConsulta as any).agendamento.modelo && (
														<>
															<p className="mb-2">
																<strong>Veículo:</strong>{" "}
																{
																	(ordemServicoConsulta as any).agendamento
																		.modelo
																}{" "}
																{(ordemServicoConsulta as any).agendamento.ano}
															</p>
														</>
													)}
													{(ordemServicoConsulta as any).agendamento
														.dataFinalizacao && (
														<p className="mb-2">
															<strong>Data de Finalização:</strong>{" "}
															{new Date(
																(
																	ordemServicoConsulta as any
																).agendamento.dataFinalizacao
															).toLocaleDateString("pt-BR")}
														</p>
													)}
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Serviço Realizado */}
								<div className="card mb-3">
									<div className="card-header bg-success text-white">
										<h6 className="mb-0">🔧 Serviço Realizado</h6>
									</div>
									<div className="card-body">
										<div className="bg-light p-3 rounded">
											<pre
												style={{
													whiteSpace: "pre-wrap",
													wordWrap: "break-word",
													fontFamily: "inherit",
													margin: 0,
												}}
											>
												{ordemServicoConsulta.servicoRealizado}
											</pre>
										</div>
									</div>
								</div>

								{/* Peças Utilizadas */}
								{ordemServicoConsulta.pecasUtilizadas && (
									<div className="card mb-3">
										<div className="card-header bg-info text-white">
											<h6 className="mb-0">🔩 Peças Utilizadas</h6>
										</div>
										<div className="card-body">
											<div className="bg-light p-3 rounded">
												<pre
													style={{
														whiteSpace: "pre-wrap",
														wordWrap: "break-word",
														fontFamily: "inherit",
														margin: 0,
													}}
												>
													{ordemServicoConsulta.pecasUtilizadas}
												</pre>
											</div>
										</div>
									</div>
								)}

								{/* Resumo Financeiro */}
								<div className="card mb-3 border-success">
									<div className="card-header bg-light">
										<h6 className="mb-0 text-success">💰 Resumo Financeiro</h6>
									</div>
									<div className="card-body">
										<div className="row">
											<div className="col-md-6">
												<div className="d-flex justify-content-between">
													<span>Valor do Serviço:</span>
													<strong className="text-success">
														R${" "}
														{ordemServicoConsulta.valor.toLocaleString(
															"pt-BR",
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															}
														)}
													</strong>
												</div>
											</div>
											<div className="col-md-6">
												<div className="text-end">
													<small className="text-muted">
														Ordem gerada em:{" "}
														{new Date(
															ordemServicoConsulta.dataServico
														).toLocaleDateString("pt-BR")}
													</small>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="alert alert-danger">
								<strong>Erro:</strong> Não foi possível carregar os dados da
								ordem de serviço.
							</div>
						)}

						<div className="d-flex justify-content-end gap-2 mt-4">
							<button
								onClick={closeConsultaOrdemModal}
								className="btn btn-secondary"
							>
								Fechar
							</button>
							{ordemServicoConsulta && (
								<button
									onClick={() => {
										// Função para imprimir ou gerar PDF (opcional)
										window.print();
									}}
									className="btn btn-primary"
								>
									🖨️ Imprimir
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AgendamentoBoard;
