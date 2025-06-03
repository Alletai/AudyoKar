// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AgendamentoBoard       from './pages/AgendamentoBoard';
import ClienteAgendamentos    from './pages/ClienteAgendamento';
import CreateAgendamentoForm from './pages/CreateAgendamentoForm';
import EditAgendamentoForm from './pages/EditAgendamentoForm'; 

console.log('✔️ App.tsx renderizando'); 

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ClienteAgendamentos />} />
      <Route path="/create" element={<CreateAgendamentoForm/>} />
      <Route path="/edit/:id" element={<EditAgendamentoForm />} />
      <Route path="/agendamentos" element={<AgendamentoBoard />} />
      <Route path="*" element={<Navigate to="/" replace />} />  
    </Routes>
  </BrowserRouter>
);

export default App;
