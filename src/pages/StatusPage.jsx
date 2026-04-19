import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getReserva } from '../services/api';
import { formatDataBR } from '../utils/format';

export default function StatusPage({ tipo }) {
  const [params] = useSearchParams();
  const reservaId = params.get('reserva');
  const [reserva, setReserva] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(reservaId));

  useEffect(() => {
    if (!reservaId) return;
    let ativo = true;
    getReserva(reservaId)
      .then((r) => ativo && setReserva(r))
      .catch(() => ativo && setReserva(null))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [reservaId]);

  const titulo =
    tipo === 'sucesso'
      ? 'Pagamento aprovado!'
      : tipo === 'pendente'
        ? 'Pagamento pendente'
        : 'Pagamento não concluído';

  const classe =
    tipo === 'sucesso' ? 'success' : tipo === 'pendente' ? 'pending' : 'error';

  const icone =
    tipo === 'sucesso' ? '✓' : tipo === 'pendente' ? '⏳' : '✕';

  return (
    <div className="page">
      <div className={`card status-card ${classe}`}>
        <div className="status-icon">{icone}</div>
        <h1 className="title">{titulo}</h1>

        {carregando && <p className="muted">Verificando sua reserva...</p>}

        {reserva && (
          <div className="status-info">
            <div>
              <span className="muted">Reserva</span>
              <strong>{reserva.id}</strong>
            </div>
            {reserva.slot_data && (
              <div>
                <span className="muted">Data / Hora</span>
                <strong>
                  {formatDataBR(reserva.slot_data)} às {reserva.slot_hora}
                </strong>
              </div>
            )}
            <div>
              <span className="muted">Participantes</span>
              <strong>{reserva.quantidade}</strong>
            </div>
            <div>
              <span className="muted">Status</span>
              <strong>{reserva.status}</strong>
            </div>
            {reserva.calendar_event_link && (
              <a
                href={reserva.calendar_event_link}
                target="_blank"
                rel="noreferrer"
                className="wa-btn"
              >
                Ver no Google Calendar
              </a>
            )}
          </div>
        )}

        {tipo === 'sucesso' && (
          <p className="footer-hint">
            Um convite foi enviado ao seu e-mail. Aguardamos você no dia!
          </p>
        )}
        {tipo === 'pendente' && (
          <p className="footer-hint">
            Assim que o pagamento for aprovado, sua reserva será confirmada
            automaticamente.
          </p>
        )}
        {tipo === 'falha' && (
          <p className="footer-hint">
            Nenhum valor foi cobrado. Você pode tentar novamente pelo link
            original enviado pelo recepcionista.
          </p>
        )}

        <Link to="/" className="link-discreto">
          Voltar
        </Link>
      </div>
    </div>
  );
}
