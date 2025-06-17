import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <form onSubmit={handleSubmit} className="container mt-4">
      <h2 className="text-center mb-4">Novo Agendamento</h2>
      <div className="mb-3">
        <label htmlFor="nome" className="form-label">Nome do Cliente</label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="modelo" className="form-label">Modelo do Carro</label>
        <input
          type="text"
          id="modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="ano" className="form-label">Ano do Carro</label>
        <input
          type="number"
          id="ano"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="placa" className="form-label">Placa</label>
        <input
          type="text"
          id="placa"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          className="form-control"
          maxLength={7}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="problema" className="form-label">Problema</label>
        <textarea
          id="problema"
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="dataAgendada" className="form-label">Data Agendada</label>
        <input
          type="date"
          id="dataAgendada"
          value={dataAgendada}
          onChange={(e) => setDataAgendada(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          type="submit"
          className="btn btn-warning"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CreateAgendamentoForm;
