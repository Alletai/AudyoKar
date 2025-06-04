// src/pages/AgendamentoBoard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  // Estados para o modal de confirmação
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [confirmModalOpenIniciar, setConfirmModalOpenIniciar] = useState(false);
  const [confirmModalOpenFinalizar, setConfirmModalOpenFinalizar] = useState(false);
  const [idToAdvance, setIdToAdvance] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

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
        // Atualiza o estado local: mapeia a lista e altera somente o status do item correspondente
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
        confirmClose(); 
      } else if (res.status === 400) {
        const erroTexto = await res.text();
        alert("Não foi possível avançar status: " + erroTexto);
      } else {
        throw new Error("Falhou ao avançar status");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao mudar status. Veja o console.");
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

  const confirmClose = () => {
    setConfirmModalOpenIniciar(false);
    setConfirmModalOpenFinalizar(false);
    setIdToAdvance(null);
  };

  // Filtra cada lista por status
  const aguardando = agendamentos.filter((a) => a.status === "Aguardando");
  const emAtendimento = agendamentos.filter((a) => a.status === "Em atendimento");
  const finalizados = agendamentos.filter((a) => a.status === "Finalizado");

  const styles = {
    board: {
      width: "100%",
      background: "#fafafa",
      padding: "20px",
      boxSizing: "border-box" as const,
      height: "100vh",
    },
    columnsContainer: {
      display: "flex" as const,
      flexDirection: "row" as const,
      gap: "16px",
      justifyContent: "center" as const,
    },
    column: {
      flex: 1,
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: "12px",
      maxWidth: "320px",
    },
    columnHeader: {
      textAlign: "center" as const,
      padding: "8px",
      background: "#333",
      color: "#fff",
      borderRadius: "4px",
      fontWeight: "bold" as const,
    },
    taskCard: {
      border: "2px solid #333",
      borderRadius: "4px",
      padding: "12px",
      background: "#fff",
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
      fontSize: "19px",
    },
    editBtn: {
      position: "absolute" as const,
      top: "8px",
      right: "35px",
      border: "none",
      background: "transparent",
      color: "#000",
      cursor: "pointer",
      fontSize: "13px",
    },
    btnAdd: {
      position: "fixed" as const,
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

  const renderCard = (ag: Agendamento) => (
    <div key={ag.id} style={styles.taskCard}>
      <button
        style={styles.editBtn}
        onClick={() => navigate(`/edit/${ag.id}`)}
        aria-label="Editar agendamento"
      >
        &#9998;
      </button>
      <button
        style={styles.deleteBtn}
        onClick={() => openConfirm(ag.id)}
        aria-label="Excluir agendamento"
      >
        &times;
      </button>

      {/* Botão de avançar status */}
      {ag.status === "Aguardando" && (
        <button
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            padding: "4px 8px",
            backgroundColor: "#0275d8",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
          onClick={() => openConfirmIniciar(ag.id)} // Abre o modal de Iniciar
        >
          Iniciar atendimento
        </button>
      )}

      {ag.status === "Em atendimento" && (
        <button
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            padding: "4px 8px",
            backgroundColor: "#5cb85c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
          onClick={() => openConfirmFinalizar(ag.id)} // Abre o modal de Finalizar
        >
          Finalizar atendimento
        </button>
      )}

      <h4>Nome: {ag.nome}</h4>
      <span
        style={{
          display: "inline-block",
          padding: "2px 6px",
          backgroundColor:
            ag.status === "Aguardando"
              ? "#f0ad4e"
              : ag.status === "Em atendimento"
              ? "#0275d8"
              : "#006400",
          color: "#fff",
          borderRadius: "4px",
          fontSize: "12px",
          marginBottom: "8px",
        }}
      >
        Status: {ag.status}
      </span>

      <p>Problema: {ag.problema}</p>
      <small>
        Data agendada: {new Date(ag.dataAgendada).toLocaleDateString("pt-BR")}
      </small>
    </div>
  );

  return (
    <div style={styles.board}>
      {loading && <p>Carregando agendamentos…</p>}

      {/* Container que segura as três colunas */}
      <div style={styles.columnsContainer}>
        <div style={styles.column}>
          <div style={styles.columnHeader}>Aguardando</div>
          {aguardando.map((ag) => renderCard(ag))}
          {aguardando.length === 0 && !loading && <p>Nenhum.</p>}
        </div>

        <div style={styles.column}>
          <div style={styles.columnHeader}>Em atendimento</div>
          {emAtendimento.map((ag) => renderCard(ag))}
          {emAtendimento.length === 0 && !loading && <p>Nenhum.</p>}
        </div>

        <div style={styles.column}>
          <div style={styles.columnHeader}>Finalizado</div>
          {finalizados.map((ag) => renderCard(ag))}
          {finalizados.length === 0 && !loading && <p>Nenhum.</p>}
        </div>
      </div>

      <button
        style={styles.btnAdd}
        onClick={() => navigate("/create")}
        aria-label="Adicionar Agendamento"
      >
        +
      </button>

      {/* Modal de confirmação de exclusão */}
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

      {/* Modal de Confirmação para Iniciar Atendimento */}
      {confirmModalOpenIniciar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p>Deseja realmente iniciar o atendimento deste agendamento?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => handleStatusAdvance(idToAdvance!)}
                style={{
                  ...styles.modalBtn,
                  background: "#0275d8",
                  color: "#fff",
                }}
              >
                Sim
              </button>
              <button
                onClick={confirmClose}
                style={{ ...styles.modalBtn, background: "#eee" }}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Finalizar Atendimento */}
      {confirmModalOpenFinalizar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p>Deseja realmente finalizar o atendimento deste agendamento?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => handleStatusAdvance(idToAdvance!)}
                style={{
                  ...styles.modalBtn,
                  background: "#5cb85c",
                  color: "#fff",
                }}
              >
                Sim
              </button>
              <button
                onClick={confirmClose}
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
