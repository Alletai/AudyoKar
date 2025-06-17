import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
	modelo: string;
	ano: number;
	placa: string;
	funcionarioResponsavel?: string;
	clienteId?: number;
	dataFinalizacao?: string;
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

const ClienteAgendamentos: React.FC = () => {
	const [nome, setNome] = useState("");
	const [placa, setPlaca] = useState("");
	const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);

	const [consultaOrdemModalOpen, setConsultaOrdemModalOpen] = useState(false);
	const [ordemServicoConsulta, setOrdemServicoConsulta] =
		useState<OrdemServicoCompleta | null>(null);
	const [carregandoOrdemConsulta, setCarregandoOrdemConsulta] = useState(false);

	const [agendamentosComOrdem, setAgendamentosComOrdem] = useState<Set<number>>(
		new Set()
	);

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

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch(
				`/api/agendamentos/search?nome=${encodeURIComponent(
					nome
				)}&placa=${encodeURIComponent(placa)}`
			);
			if (res.status === 404) {
				alert("Cliente não encontrado.");
				setAgendamentos([]);
			} else if (!res.ok) {
				throw new Error("Erro ao buscar agendamentos");
			} else {
				const data: Agendamento[] = await res.json();
				setAgendamentos(data);
				await verificarOrdensServico(data);
			}
		} catch (err) {
			console.error(err);
			alert("Deu ruim!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mt-4">
			<div>
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
								<li className="nav-item">
									<Link className="nav-link" to="/agendamentos">
										Funcionários
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</nav>
			</div>

			{/* Formulário de busca */}
			<form onSubmit={handleSearch} className="d-flex mb-4">
				<input
					type="text"
					placeholder="Nome do Cliente"
					value={nome}
					onChange={(e) => setNome(e.target.value)}
					className="form-control me-2"
					required
				/>
				<input
					type="text"
					placeholder="Placa do Carro"
					value={placa}
					onChange={(e) => setPlaca(e.target.value)}
					className="form-control me-2"
					maxLength={8}
					required
				/>
				<button type="submit" className="btn btn-warning">
					{loading ? "Buscando…" : "Buscar"}
				</button>
			</form>

			{/* Lista de agendamentos */}
			<div className="list-group">
				{agendamentos.map((ag) => (
					<div
						key={ag.id}
						className="list-group-item d-flex justify-content-between align-items-center"
					>
						<div>
							<h5>{ag.nome}</h5>
							<p>
								<strong>Modelo:</strong> {ag.modelo}
							</p>
							<p>
								<strong>Placa:</strong> {ag.placa} — <strong>Ano:</strong>{" "}
								{ag.ano}
							</p>
							<p>
								<span
									className={`badge ${
										ag.status === "Aguardando"
											? "bg-warning"
											: ag.status === "Em atendimento"
											? "bg-primary"
											: "bg-success"
									}`}
								>
									{ag.status}
								</span>
							</p>
							<p>{ag.problema}</p>
							<small>
								Data: {new Date(ag.dataAgendada).toLocaleDateString("pt-BR")}
							</small>
						</div>

						<div className="d-flex gap-2">
							{ag.status === "Aguardando" && (
								<>
									<button
										onClick={() => navigate(`/edit/${ag.id}`)}
										className="btn btn-warning btn-sm me-2"
										aria-label="Editar agendamento"
									>
										✏️
									</button>
									<button
										onClick={() => openConfirm(ag.id)}
										className="btn btn-danger btn-sm"
										aria-label="Excluir agendamento"
									>
										🗑️
									</button>
								</>
							)}
							
							{/* Botão Consultar Ordem - só aparece se tiver ordem de serviço */}
							{ag.status === "Finalizado" && agendamentosComOrdem.has(ag.id) && (
								<button 
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										openConsultaOrdemModal(ag);
									}}
									className="btn btn-info btn-sm"
									title="Consultar Ordem de Serviço"
									aria-label="Consultar Ordem de Serviço"
								>
									Consultar Ordem								
								</button>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Botão flutuante para adicionar agendamento */}
			<button
				onClick={() => navigate("/create")}
				className="btn btn-warning btn-circle position-fixed bottom-0 end-0 m-4" style={{
					width: '60px',
					height: '60px',
					borderRadius: '50%',
					fontSize: '24px',
					boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
				}} title="Adicionar agendamento">➕</button>

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

			{/* Modal para Consultar Ordem de Serviço - IDÊNTICO ao AgendamentoBoard */}
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

export default ClienteAgendamentos;