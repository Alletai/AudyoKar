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
`;
// Adiciona o CSS ao head se ainda não existir
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

	const navigate = useNavigate();
	const location = useLocation();

	// Pegando funcionário logado do localStorage
	const funcionarioLogado = JSON.parse(
		localStorage.getItem("funcionarioLogado") || "null"
	);

	useEffect(() => {
		setLoading(true);
		fetch("/api/agendamentos")
			.then((res) => {
				if (!res.ok) throw new Error("Falha ao buscar agendamentos");
				return res.json();
			})
			.then((data: Agendamento[]) => setAgendamentos(data))
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
			const res = await fetch(`/api/agendamentos/${id}/status`, {
				method: "PATCH",
			});
			if (res.status === 204) {
				setAgendamentos((prev) =>
					prev.map((a) => {
						if (a.id !== id) return a;
						let novoStatus = "";
						if (a.status === "Aguardando") novoStatus = "Em atendimento";
						else if (a.status === "Em atendimento") novoStatus = "Finalizado";
						else novoStatus = a.status;
						return { ...a, status: novoStatus };
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
											Funcionários
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

			<div className="row">
				{/* Coluna Aguardando */}
				<div className="col-md-4">
					<div className="bg-warning text-white p-3 mb-4 rounded text-center">
						Aguardando
					</div>
					{aguardando.map((ag) => (
						<div key={ag.id} className="card mb-3">
							<div className="card-body">
								<h5 className="card-title">{ag.nome}</h5>
								<p>
									<strong>Problema:</strong> {ag.problema}
								</p>
								<p>
									<strong>Data Agendada:</strong>{" "}
									{new Date(ag.dataAgendada).toLocaleDateString()}
								</p>
								<p>
									<span className="badge bg-warning">Aguardando</span>
								</p>
								<button
									onClick={(e) => {
										e.preventDefault();
										openConfirmIniciar(ag.id);
									}}
									className="btn btn-primary btn-sm me-2"
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
					))}
				</div>

				{/* Coluna Em Atendimento */}
				<div className="col-md-4">
					<div className="bg-primary text-white p-3 mb-4 rounded text-center">
						Em Atendimento
					</div>
					{emAtendimento.map((ag) => (
						<div key={ag.id} className="card mb-3">
							<div className="card-body">
								<h5 className="card-title">{ag.nome}</h5>
								<p>
									<strong>Problema:</strong> {ag.problema}
								</p>
								<p>
									<strong>Data Agendada:</strong>{" "}
									{new Date(ag.dataAgendada).toLocaleDateString()}
								</p>
								<p>
									<span className="badge bg-primary">Em Atendimento</span>
								</p>
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										openConfirmFinalizar(ag.id);
									}}
									className="btn btn-success btn-sm me-2"
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
					))}
				</div>

				{/* Coluna Finalizados */}
				<div className="col-md-4">
					<div className="bg-success text-white p-3 mb-4 rounded text-center">
						Finalizado
					</div>
					{finalizados.map((ag) => (
						<div key={ag.id} className="card mb-3">
							<div className="card-body">
								<h5 className="card-title">{ag.nome}</h5>
								<p>
									<strong>Problema:</strong> {ag.problema}
								</p>
								<p>
									<strong>Data Agendada:</strong>{" "}
									{new Date(ag.dataAgendada).toLocaleDateString()}
								</p>
								<p>
									<span className="badge bg-success">Finalizado</span>
								</p>
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
				title="Adicionar funcionário"
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
		</div>
	);
};

export default AgendamentoBoard;
