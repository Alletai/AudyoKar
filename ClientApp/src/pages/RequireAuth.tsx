import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth: React.FC = () => {
  const funcionarioLogado = localStorage.getItem("funcionarioLogado");
  return funcionarioLogado ? <Outlet /> : <Navigate to="/login-funcionario" replace />;
};

export default RequireAuth;
