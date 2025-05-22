// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AgendamentoBoard from './pages/AgendamentoBoard';
import CreateAgendamentoForm from './pages/CreateAgendamentoForm';

console.log('✔️ App.tsx renderizando'); // deve aparecer no console

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AgendamentoBoard />} />
      <Route path="/create" element={<CreateAgendamentoForm/>} />
    </Routes>
  </BrowserRouter>
);

export default App;
