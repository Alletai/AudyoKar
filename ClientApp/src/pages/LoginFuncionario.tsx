import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginFuncionario: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/funcionarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        const err = await res.text();
        setError(err || "Credenciais inválidas");
        return;
      }
      const data = await res.json();
      // Salva usuário logado no localStorage
      localStorage.setItem("funcionarioLogado", JSON.stringify(data));
      // Redireciona para o Board
      navigate("/agendamentos");
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">AudyoKar Funcionarios</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">E-mail</label>
          <input type="email" id="email" className="form-control" required
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="senha" className="form-label">Senha</label>
          <input type="password" id="senha" className="form-control" required
            value={senha} onChange={e => setSenha(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-warning w-100">Entrar</button>
      </form>
    </div>
  );
};

export default LoginFuncionario;
