import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ReservaPage from './pages/ReservaPage';
import StatusPage from './pages/StatusPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/reserva/:slotId" element={<ReservaPage />} />
        <Route path="/sucesso" element={<StatusPage tipo="sucesso" />} />
        <Route path="/pendente" element={<StatusPage tipo="pendente" />} />
        <Route path="/falha" element={<StatusPage tipo="falha" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
