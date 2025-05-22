// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AgendamentoBoard from './pages/AgendamentoBoard';
import CreateAgendamentoForm from './pages/CreateAgendamentoForm';
import EditAgendamentoForm from './pages/EditAgendamentoForm'; // você criará este

console.log('✔️ App.tsx renderizando'); // deve aparecer no console

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AgendamentoBoard />} />
      <Route path="/create" element={<CreateAgendamentoForm/>} />
      <Route path="/edit/:id" element={<EditAgendamentoForm />} />
    </Routes>
  </BrowserRouter>
);

export default App;
