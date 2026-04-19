import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Escape Room · Reservas</h1>
        <p className="subtitle">
          Reservas são feitas exclusivamente via link enviado pelo recepcionista
          no WhatsApp.
        </p>

        <div className="footer-hint">
          <p>
            Já recebeu seu link? Abra-o diretamente no WhatsApp para continuar.
          </p>
          <p>
            É administrador?{' '}
            <Link to="/admin" className="link-discreto">
              Acessar painel
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
