// src/pages/ClienteAgendamentos.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
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
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setAgendamentos(prev => prev.filter(a => a.id !== idToDelete));
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o agendamento.');
    } finally {
      closeConfirm();
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agendamentos/search?nome=${encodeURIComponent(nome)}&placa=${encodeURIComponent(placa)}`
      );
      if (res.status === 404) {
        alert('Cliente não encontrado.');
        setAgendamentos([]);
      } else if (!res.ok) {
        throw new Error('Erro ao buscar agendamentos');
      } else {
        const data: Agendamento[] = await res.json();
        setAgendamentos(data);
      }
    } catch (err) {
      console.error(err);
      alert('Deu ruim!');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    board: {
      position: 'relative' as const,
      width: '100%',
      background: '#fafafa',
      padding: '20px',
      boxSizing: 'border-box' as const,
      height: '100vh'
    },
    searchForm: {
      display: 'flex' as const,
      gap: '8px',
      marginBottom: '20px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    input: {
      flex: 1,
      padding: '8px',
      fontSize: '16px',
    },
    tasks: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      gap: '12px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    taskCard: {
      border: '2px solid #333',
      borderRadius: '4px',
      padding: '12px',
      background: '#fff',
      position: 'relative' as const,
      top: '10px'
    },
    btnAdd: {
      position: 'fixed' as const,
      bottom: '24px',
      right: '24px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: '#333',
      color: '#fff',
      fontSize: '32px',
      lineHeight: '48px',
      textAlign: 'center' as const,
      cursor: 'pointer' as const,
      border: 'none',
    },
    editBtn: {
      position: 'absolute' as const,
      top: '8px',
      right: '36px',
      border: 'none',
      background: 'transparent',
      color: '#000',
      cursor: 'pointer',
      fontSize: '16px',
    },
    deleteBtn: {
      position: 'absolute' as const,
      top: '8px',
      right: '8px',
      border: 'none',
      background: 'transparent',
      color: '#c00',
      cursor: 'pointer',
      fontSize: '16px',
    },
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      zIndex: 1000,
    },
    modal: {
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '300px',
      textAlign: 'center' as const,
    },
    modalButtons: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      marginTop: '16px',
    },
    modalBtn: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.board}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          style={styles.input}
          placeholder="Nome do Cliente"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <input
          style={styles.input}
          placeholder="Placa do Carro"
          value={placa}
          onChange={e => setPlaca(e.target.value)}
          maxLength={8}
          required
        />
        <button type="submit" style={{ fontSize: '16px' }}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      <div style={styles.tasks}>
        {agendamentos.length === 0 && !loading && <p>Nenhum agendamento.</p>}
        {agendamentos.map(ag => (
          <div key={ag.id} style={styles.taskCard}>
            {/* editar */}
            {ag.status === "Aguardando" &&( 
            <button
              style={styles.editBtn}
              onClick={() => navigate(`/edit/${ag.id}`)}
              aria-label="Editar agendamento"
            >
              &#9998;
            </button>
            )}
            {/* excloir */}
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
            <p><strong>Modelo:</strong> {ag.modelo}</p>
            <p>
              <strong>Placa:</strong> {ag.placa} — <strong>Ano:</strong> {ag.ano}
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 6px',
                backgroundColor:
                  ag.status === 'Aguardando'
                    ? '#f0ad4e'
                    : ag.status === 'Em atendimento'
                    ? '#0275d8'
                    : '#5cb85c',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              {ag.status}
            </span>
            <p>{ag.problema}</p>
            <small>
              Data: {new Date(ag.dataAgendada).toLocaleDateString('pt-BR')}
            </small>
          </div>
        ))}
      </div>

      {/* botão de adicionar */}
      <button
        style={styles.btnAdd}
        onClick={() => navigate('/create')}
        aria-label="Adicionar Agendamento"
      >
        +
      </button>

      {/* modal de confirmação */}
      {confirmModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p>Deseja realmente excluir este agendamento?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={confirmDelete}
                style={{ ...styles.modalBtn, background: '#c00', color: '#fff' }}
              >
                Sim
              </button>
              <button
                onClick={closeConfirm}
                style={{ ...styles.modalBtn, background: '#eee' }}
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

export default ClienteAgendamentos;
