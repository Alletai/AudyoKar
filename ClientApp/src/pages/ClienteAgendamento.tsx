import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

interface Agendamento {
	id: number;
	nome: string;
	problema: string;
	dataAgendada: string;
	status: string;
	modelo: string;
	ano: number;
	placa: string;
}

const ClienteAgendamentos: React.FC = () => {
	const [nome, setNome] = useState("");
	const [placa, setPlaca] = useState("");
	const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);

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

						<div>
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
				  }} title="Adicionar funcionário">➕</button>

			{/* Modal de confirmação de exclusão */}
			{confirmModalOpen && (
				<div className="modal-overlay">
					<div className="modal">
						<p>Deseja realmente excluir este agendamento?</p>
						<div className="d-flex justify-content-between">
							<button onClick={confirmDelete} className="btn btn-danger">
								Sim
							</button>
							<button onClick={closeConfirm} className="btn btn-secondary">
								Não
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClienteAgendamentos;
