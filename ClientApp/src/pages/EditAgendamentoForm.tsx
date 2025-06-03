import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditAgendamentoForm: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [nome, setNome] = useState("");
	const [modelo, setModelo] = useState("");
	const [ano, setAno] = useState(new Date().getFullYear());
	const [placa, setPlaca] = useState("");
	const [problema, setProblema] = useState("");
	const [dataAgendada, setDataAgendada] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetch(`/api/agendamentos/${id}`)
			.then((res) => {
				if (!res.ok) throw new Error("Não encontrou agendamento");
				return res.json();
			})
			.then((dto: any) => {
				setNome(dto.nome);
				setModelo(dto.modelo);
				setAno(dto.ano);
				setPlaca(dto.placa);
				setProblema(dto.problema);
				setDataAgendada(dto.dataAgendada.slice(0, 10));
			})
			.catch(console.error);
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);

		const body = { nome, modelo, ano, placa, problema, dataAgendada };

		const res = await fetch(`/api/agendamentos/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		if (res.ok) {
			navigate("/");
		} else {
			const err = await res.text();
			alert("Erro ao atualizar: " + err);
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				maxWidth: 400,
				margin: "20px auto",
				display: "flex",
				flexDirection: "column",
				gap: 12,
			}}
		>
			<h2>Editar Agendamento</h2>

			<label>Nome do Cliente</label>
			<input value={nome} onChange={(e) => setNome(e.target.value)} required />

			<label>Modelo do Carro</label>
			<input
				value={modelo}
				onChange={(e) => setModelo(e.target.value)}
				required
			/>

			<label>Ano do Carro</label>
			<input
				type="number"
				value={ano}
				onChange={(e) => setAno(Number(e.target.value))}
				required
			/>

			<label>Placa</label>
			<input
				value={placa}
				onChange={(e) => setPlaca(e.target.value)}
				required
			/>

			<label>Problema</label>
			<textarea
				value={problema}
				onChange={(e) => setProblema(e.target.value)}
				required
			/>

			<label>Data Agendada</label>
			<input
				type="date"
				value={dataAgendada}
				onChange={(e) => setDataAgendada(e.target.value)}
				required
			/>

			<div style={{ marginTop: 10, display: "flex", gap: 10 }}>
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Atualizando…" : "Salvar"}
				</button>
				<button type="button" onClick={() => navigate("/")}>
					Cancelar
				</button>
			</div>
		</form>
	);
};

export default EditAgendamentoForm;
