// src/pages/AgendamentoBoard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // 1) Declaração dos estados para o modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const navigate = useNavigate();

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
  }, []);

  const openConfirm = (id: number) => {
    setIdToDelete(id);
    setConfirmModalOpen(true);
  };

  const closeConfirm = () => {
    setConfirmModalOpen(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    // 2) Aqui usamos idToDelete, não `id`
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

  const styles = {
    board: {
      position: "relative" as const,
      width: "100%",
      height: "100vh",
      background: "#fafafa",
      padding: "20px",
      boxSizing: "border-box" as const,
      overflowY: "auto" as const,
    },
    tasks: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: "12px",
    },
    taskCard: {
      border: "2px solid #333",
      borderRadius: "4px",
      padding: "12px",
      background: "#fff",
      maxWidth: "400px",
      position: "relative" as const,
    },
    deleteBtn: {
      position: "absolute" as const,
      top: "8px",
      right: "8px",
      border: "none",
      background: "transparent",
      color: "#c00",
      cursor: "pointer",
      fontSize: "16px",
    },
    btnAdd: {
      position: "absolute" as const,
      bottom: "24px",
      right: "24px",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "#333",
      color: "#fff",
      fontSize: "32px",
      lineHeight: "48px",
      textAlign: "center" as const,
      cursor: "pointer" as const,
      border: "none",
    },
    // estilos do modal
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      zIndex: 1000,
    },
    modal: {
      background: "#fff",
      padding: "20px",
      borderRadius: "8px",
      maxWidth: "300px",
      textAlign: "center" as const,
    },
    modalButtons: {
      display: "flex" as const,
      justifyContent: "space-between" as const,
      marginTop: "16px",
    },
    modalBtn: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.board}>
      {loading && <p>Carregando agendamentos…</p>}
      <div style={styles.tasks}>
        {agendamentos.map((ag) => (
          <div key={ag.id} style={styles.taskCard}>
            {/* só mostra o botão se estiver Aguardando */}
            {ag.status === "Aguardando" && (
              <button
                style={styles.deleteBtn}
                onClick={() => openConfirm(ag.id)}
                aria-label="Excluir agendamento"
              >
                &times;
              </button>
            )}

            <h4>{ag.nome}</h4>
            {/* badge de status */}
            <span
              style={{
                display: "inline-block",
                padding: "2px 6px",
                backgroundColor:
                  ag.status === "Aguardando"
                    ? "#f0ad4e"
                    : ag.status === "Em atendimento"
                    ? "#0275d8"
                    : ag.status === "Finalizado" 
                    ? "#006400"
                    : "#fff",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              {ag.status}
            </span>

            <p>{ag.problema}</p>
            <small>
              Data: {new Date(ag.dataAgendada).toLocaleDateString("pt-BR")}
            </small>
          </div>
        ))}
        {agendamentos.length === 0 && !loading && <p>Não há agendamentos.</p>}
      </div>

      <button
        style={styles.btnAdd}
        onClick={() => navigate("/create")}
        aria-label="Adicionar Agendamento"
      >
        +
      </button>

      {/*  ——— Modal de confirmação ——— */}
      {confirmModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p>Deseja realmente excluir este agendamento?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={confirmDelete}
                style={{
                  ...styles.modalBtn,
                  background: "#c00",
                  color: "#fff",
                }}
              >
                Sim
              </button>
              <button
                onClick={closeConfirm}
                style={{ ...styles.modalBtn, background: "#eee" }}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamentoBoard;
