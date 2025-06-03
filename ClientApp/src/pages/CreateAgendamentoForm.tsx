import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateAgendamentoForm: React.FC = () => {
	const [nome, setNome] = useState<string>("");
	const [modelo, setModelo] = useState<string>("");
	const [ano, setAno] = useState<number>(new Date().getFullYear());
	const [placa, setPlaca] = useState<string>("");
	const [problema, setProblema] = useState<string>("");
	const [dataAgendada, setDataAgendada] = useState<string>(
		new Date().toISOString().slice(0, 10)
	);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isSubmitting) return; // previne envio duplicado
		setIsSubmitting(true);

		const body = { nome, modelo, ano, placa, problema, dataAgendada };

		try {
			const res = await fetch("/api/agendamentos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const errText = await res.text();
				throw new Error(errText || "Erro ao criar agendamento");
			}
			navigate("/");
		} catch (err) {
			console.error(err);
			alert("Falha ao salvar agendamento. Veja o console para detalhes.");
		} finally {
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
			<h2>Novo Agendamento</h2>

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
				maxLength={8}
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
					{isSubmitting ? "Salvando..." : "Salvar"}
				</button>
				<button type="button" onClick={() => navigate("/")}>
					Cancelar
				</button>
			</div>
		</form>
	);
};

export default CreateAgendamentoForm;
