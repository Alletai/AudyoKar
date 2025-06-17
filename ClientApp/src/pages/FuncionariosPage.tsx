import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Interfaces
interface FuncionarioDto {
	id: number;
	nome: string;
	email: string;
	cargo: string; 
	funcao: string;
	senha: string; 
	isAdmin: boolean;
}

interface CreateFuncionarioViewModel {
	nome: string;
	email: string;
	senha: string;
	funcao: string;
	isAdmin: boolean;
}

interface EditFuncionarioData extends CreateFuncionarioViewModel {
	id: number;
}

const FuncionariosPage: React.FC = () => {
	const [funcionarios, setFuncionarios] = useState<FuncionarioDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Estados do modal
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [editingFuncionario, setEditingFuncionario] =
		useState<EditFuncionarioData | null>(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);

	const [formData, setFormData] = useState<CreateFuncionarioViewModel>({
		nome: "",
		email: "",
		senha: "",
		funcao: "",
		isAdmin: false,
	});

	const [formLoading, setFormLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const navigate = useNavigate();

	// Opções de funções disponíveis
	const funcoesDisponiveis = [
		{ value: "Mecânico", label: "Mecânico" },
		{ value: "Eletricista", label: "Eletricista" },
		{ value: "Funileiro", label: "Funileiro" },
		{ value: "Borracheiro", label: "Borracheiro" },
	];

	// Pega o funcionário logado do localStorage
	const funcionarioLogado = JSON.parse(
		localStorage.getItem("funcionarioLogado") || "null"
	);

	// BLOQUEIO DE ACESSO SE NÃO FOR ADMIN
	if (!funcionarioLogado?.isAdmin) {
		return (
			<div
				className="modal-overlay"
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(0,0,0,0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 9999,
				}}
			>
				<div
					className="modal-content"
					style={{
						background: "white",
						padding: 30,
						borderRadius: 8,
						boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
						minWidth: 300,
						maxWidth: 400,
						textAlign: "center",
					}}
				>
					<h5 className="mb-3">Acesso Restrito</h5>
					<p>
						Você não tem permissão para acessar essa página, contate o
						administrador
					</p>
					<button
						className="btn btn-warning mt-3"
						onClick={() => navigate("/agendamentos")}
					>
						Voltar para Atendimentos
					</button>
				</div>
			</div>
		);
	}

	const fetchFuncionarios = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/funcionarios");
			if (!response.ok) {
				throw new Error("Erro ao carregar funcionários");
			}
			const data: FuncionarioDto[] = await response.json();
			setFuncionarios(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro desconhecido");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFuncionarios();
	}, []);

	const openCreateModal = () => {
		setModalMode("create");
		setFormData({ nome: "", email: "", senha: "", funcao: "", isAdmin: false });
		setEditingFuncionario(null);
		setFormError(null);
		setShowModal(true);
	};

	const openEditModal = async (funcionario: FuncionarioDto) => {
		try {
			const response = await fetch(`/api/funcionarios/${funcionario.id}`);
			if (!response.ok) {
				throw new Error("Erro ao buscar dados do funcionário");
			}

			const funcionarioCompleto: FuncionarioDto = await response.json();

			setModalMode("edit");
			setFormData({
				nome: funcionarioCompleto.nome,
				email: funcionarioCompleto.email,
				senha: funcionarioCompleto.senha,
				funcao: funcionarioCompleto.funcao || "",
				isAdmin: funcionarioCompleto.isAdmin,
			});
			setEditingFuncionario({
				id: funcionarioCompleto.id,
				nome: funcionarioCompleto.nome,
				email: funcionarioCompleto.email,
				senha: funcionarioCompleto.senha, 
				funcao: funcionarioCompleto.funcao || "",
				isAdmin: funcionarioCompleto.isAdmin,
			});
			setFormError(null);
			setShowModal(true);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erro ao carregar funcionário"
			);
		}
	};

	const closeModal = () => {
		setShowModal(false);
		setFormData({ nome: "", email: "", senha: "", funcao: "", isAdmin: false });
		setEditingFuncionario(null);
		setFormError(null);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type, checked } = e.target as any;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (formError) setFormError(null);
	};

	// Validar formulário
	const validateForm = (): boolean => {
		if (!formData.nome.trim()) {
			setFormError("Nome é obrigatório");
			return false;
		}
		if (formData.nome.trim().length < 2) {
			setFormError("Nome deve ter pelo menos 2 caracteres");
			return false;
		}
		if (formData.nome.trim().length > 100) {
			setFormError("Nome deve ter no máximo 100 caracteres");
			return false;
		}
		if (!formData.email.trim()) {
			setFormError("E-mail é obrigatório");
			return false;
		}
		if (!/\S+@\S+\.\S+/.test(formData.email)) {
			setFormError("E-mail inválido");
			return false;
		}

		if (
			modalMode === "create" &&
			(!formData.senha || formData.senha.length < 6)
		) {
			setFormError("Senha deve ter no mínimo 6 caracteres");
			return false;
		}

		if (modalMode === "edit" && formData.senha && formData.senha.length < 6) {
			setFormError("Senha deve ter no mínimo 6 caracteres");
			return false;
		}

		if (!formData.funcao) {
			setFormError("Função é obrigatória");
			return false;
		}
		return true;
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		setFormLoading(true);
		setFormError(null);

		try {
			const url =
				modalMode === "create"
					? "/api/funcionarios"
					: `/api/funcionarios/${editingFuncionario?.id}`;

			const method = modalMode === "create" ? "POST" : "PUT";

			const dataToSend: any = {
				nome: formData.nome.trim(),
				email: formData.email.trim(),
				funcao: formData.funcao,
				isAdmin: formData.isAdmin,
			};

			if (modalMode === "create") {
				dataToSend.senha = formData.senha;
			} else if (modalMode === "edit") {
				dataToSend.senha = formData.senha;
			}

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dataToSend),
			});

			if (!response.ok) {
				const errorMessage = await response.text();
				throw new Error(
					errorMessage ||
						`Erro ao ${
							modalMode === "create" ? "criar" : "atualizar"
						} funcionário`
				);
			}

			await fetchFuncionarios();
			closeModal();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Erro desconhecido");
		} finally {
			setFormLoading(false);
		}
	};
	const handleDelete = (id: number) => {
		setIdToDelete(id);
		setConfirmModalOpen(true);
	};

	const confirmDelete = async () => {
		if (idToDelete == null) return;

		try {
			const res = await fetch(`/api/funcionarios/${idToDelete}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Erro ao excluir");

			setFuncionarios((prev) => prev.filter((a) => a.id !== idToDelete));
			setConfirmModalOpen(false);
		} catch (err) {
			console.error(err);
			alert("Não foi possível excluir o funcionário.");
		}
	};

	const cancelDelete = () => {
		setConfirmModalOpen(false);
	};

	if (loading) {
		return <div className="loading-message">Carregando funcionários...</div>;
	}

	return (
		<div className="container mt-4">
			{/* Header/NAV */}
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
								<Link className="nav-link" to="/funcionarios">
									Gerenciamento
								</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link" to="/agendamentos">
									Agendamentos
								</Link>
							</li>
						</ul>
						{/* Espaço para alinhar à direita */}
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

			<div className="header">
				<h1 className="text-center mb-4">Funcionários</h1>
				<p className="text-center mb-4">Gerencie os funcionários da oficina</p>
			</div>
			{error && <div className="alert alert-danger">{error}</div>}

			{/* Tabela */}
			<div className="table-responsive">
				<table className="table table-bordered table-striped">
					<thead className="thead-dark">
						<tr>
							<th>Nome</th>
							<th>E-mail</th>
							<th>Função</th>
							<th>Admin</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{funcionarios.length === 0 ? (
							<tr>
								<td colSpan={5} className="text-center">
									Nenhum funcionário cadastrado
								</td>
							</tr>
						) : (
							funcionarios.map((funcionario) => (
								<tr key={funcionario.id}>
									<td>{funcionario.nome}</td>
									<td>{funcionario.email}</td>
									<td>{funcionario.funcao || "Não definida"}</td>
									<td>{funcionario.isAdmin ? "Sim" : "Não"}</td>
									<td className="actions">
										<button
											onClick={() => openEditModal(funcionario)}
											className="btn btn-warning btn-sm me-2"
											title="Editar"
										>
											✏️
										</button>
										<button
											onClick={() => handleDelete(funcionario.id)}
											className="btn btn-danger btn-sm"
											title="Excluir"
										>
											🗑️
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Botão flutuante */}
			<button
				onClick={openCreateModal}
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
					className="modal fade show"
					style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
					aria-hidden="true"
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Confirmar Exclusão</h5>
								<button
									type="button"
									className="btn-close"
									onClick={cancelDelete}
								></button>
							</div>
							<div className="modal-body">
								<p>Deseja realmente excluir este funcionário?</p>
							</div>
							<div className="modal-footer">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={cancelDelete}
								>
									Cancelar
								</button>
								<button
									type="button"
									className="btn btn-danger"
									onClick={confirmDelete}
								>
									Sim, Excluir
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal para criação ou edição de funcionário */}
			{showModal && (
				<div
					className="modal fade show"
					style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
					aria-hidden="true"
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">
									{modalMode === "create"
										? "Novo Funcionário"
										: "Editar Funcionário"}
								</h5>
								<button
									type="button"
									className="btn-close"
									onClick={closeModal}
								></button>
							</div>
							<form onSubmit={handleSubmit}>
								<div className="modal-body">
									<div className="mb-3">
										<label htmlFor="nome" className="form-label">
											Nome *
										</label>
										<input
											type="text"
											id="nome"
											name="nome"
											value={formData.nome}
											onChange={handleInputChange}
											className="form-control"
											required
										/>
									</div>

									<div className="mb-3">
										<label htmlFor="email" className="form-label">
											E-mail *
										</label>
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											className="form-control"
											required
										/>
									</div>

									{modalMode === "create" && (
										<div className="mb-3">
											<label htmlFor="senha" className="form-label">
												Senha *
											</label>
											<input
												type="password"
												id="senha"
												name="senha"
												value={formData.senha}
												onChange={handleInputChange}
												className="form-control"
												required
												minLength={6}
											/>
										</div>
									)}

									{modalMode === "edit" && (
										<div className="mb-3">
											<label htmlFor="senha" className="form-label">
												Senha
											</label>
											<input
												type="password"
												id="senha"
												name="senha"
												value={formData.senha}
												onChange={handleInputChange}
												className="form-control"
												minLength={6} 
											/>
										</div>
									)}

									<div className="mb-3">
										<label htmlFor="funcao" className="form-label">
											Função *
										</label>
										<select
											id="funcao"
											name="funcao"
											value={formData.funcao}
											onChange={handleInputChange}
											className="form-select"
											required
										>
											<option value="">Selecione uma função</option>
											{funcoesDisponiveis.map((funcao) => (
												<option key={funcao.value} value={funcao.value}>
													{funcao.label}
												</option>
											))}
										</select>
									</div>

									<div className="form-check mb-3">
										<input
											type="checkbox"
											id="isAdmin"
											name="isAdmin"
											checked={formData.isAdmin}
											onChange={handleInputChange}
											className="form-check-input"
										/>
										<label htmlFor="isAdmin" className="form-check-label">
											Administrador
										</label>
									</div>

									{/* Erro do formulário */}
									{formError && (
										<div className="alert alert-danger">{formError}</div>
									)}
								</div>

								<div className="modal-footer">
									<button
										type="button"
										className="btn btn-secondary"
										onClick={closeModal}
									>
										Cancelar
									</button>
									<button
										type="submit"
										className="btn btn-warning"
										disabled={formLoading}
									>
										{formLoading
											? "Salvando..."
											: modalMode === "create"
											? "Criar"
											: "Salvar"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default FuncionariosPage;
