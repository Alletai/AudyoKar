import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

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
      className="container mt-4"
    >
      <h2 className="text-center mb-4">Editar Agendamento</h2>

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
          {isSubmitting ? "Atualizando…" : "Salvar"}
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

export default EditAgendamentoForm;
