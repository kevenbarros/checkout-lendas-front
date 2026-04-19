import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { getSlot } from '../services/api';

export default function ReservaPage() {
  const { slotId } = useParams();
  const [slot, setSlot] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    getSlot(slotId)
      .then((s) => {
        if (ativo) setSlot(s);
      })
      .catch((err) => {
        if (ativo) setErro(err.message);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [slotId]);

  if (carregando) {
    return (
      <div className="page">
        <div className="card">
          <p className="muted">Carregando horário...</p>
        </div>
      </div>
    );
  }

  if (erro || !slot) {
    return (
      <div className="page">
        <div className="card">
          <h1 className="title">Link inválido</h1>
          <p className="muted">{erro || 'Horário não encontrado.'}</p>
          <p className="footer-hint">
            Solicite um novo link ao recepcionista da Escape Room.
          </p>
        </div>
      </div>
    );
  }

  if (!slot.disponivel) {
    return (
      <div className="page">
        <div className="card">
          <h1 className="title">Horário indisponível</h1>
          <p className="muted">
            Esta data/hora já foi reservada. Entre em contato com a recepção
            para receber um novo link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <BookingForm slot={slot} />
    </div>
  );
}
