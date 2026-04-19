import React, { useEffect, useState } from 'react';
import { criarSlot, listarSlots } from '../services/api';
import { formatDataBR } from '../utils/format';
import CuponsAdmin from '../components/CuponsAdmin';

const TOKEN_KEY = 'er_admin_token';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function precoDefaultParaData(dataISO) {
  if (!dataISO) return 60;
  const [y, m, d] = dataISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dia = dt.getDay();
  return dia === 0 || dia === 6 ? 65 : 60;
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [data, setData] = useState(todayISO());
  const [hora, setHora] = useState('19:00');
  const [duracao, setDuracao] = useState(60);
  const [preco, setPreco] = useState(precoDefaultParaData(todayISO()));
  const [precoEditadoManualmente, setPrecoEditadoManualmente] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);
  const [slots, setSlots] = useState([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    localStorage.setItem(TOKEN_KEY, token);
  }, [token]);

  useEffect(() => {
    if (!precoEditadoManualmente) {
      setPreco(precoDefaultParaData(data));
    }
  }, [data, precoEditadoManualmente]);

  async function carregarSlots() {
    setErro('');
    setCarregandoSlots(true);
    try {
      const resp = await listarSlots({ data, adminToken: token });
      setSlots(resp.slots || []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregandoSlots(false);
    }
  }

  async function handleCriar(e) {
    e.preventDefault();
    setErro('');
    setResultado(null);
    setCriando(true);
    try {
      const resp = await criarSlot({
        data,
        hora,
        duracaoMin: Number(duracao),
        precoPorPessoa: Number(preco),
        adminToken: token,
      });
      setResultado(resp);
      carregarSlots();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCriando(false);
    }
  }

  async function copiar(texto, id) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="admin-container">
      <div className="card admin-card">
        <h1 className="title">Painel do Recepcionista</h1>
        <p className="subtitle">
          Gere horários disponíveis e envie o link personalizado ao cliente.
        </p>

        <div className="field">
          <label className="label">Token de administrador</label>
          <input
            type="password"
            className="input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="x-admin-token"
          />
          <small className="hint">
            Mesmo valor de <code>ADMIN_TOKEN</code> no backend.
          </small>
        </div>

        <form onSubmit={handleCriar} className="grid-3">
          <div className="field">
            <label className="label">Data</label>
            <input
              type="date"
              className="input"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">Hora</label>
            <input
              type="time"
              className="input"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">Duração (min)</label>
            <input
              type="number"
              className="input"
              value={duracao}
              min="15"
              max="480"
              onChange={(e) => setDuracao(e.target.value)}
              required
            />
          </div>

          <div className="field span-3">
            <label className="label">Preço por pessoa (R$)</label>
            <div className="price-field-row">
              <input
                type="number"
                className="input"
                value={preco}
                step="0.01"
                min="0"
                onChange={(e) => {
                  setPreco(e.target.value);
                  setPrecoEditadoManualmente(true);
                }}
                required
              />
              {precoEditadoManualmente && (
                <button
                  type="button"
                  className="btn-secondary sm"
                  onClick={() => {
                    setPrecoEditadoManualmente(false);
                    setPreco(precoDefaultParaData(data));
                  }}
                >
                  Usar padrão
                </button>
              )}
            </div>
            <small className="hint">
              Padrão: R$60 (seg-sex) · R$65 (fim de semana). Edite se quiser personalizar.
            </small>
          </div>

          <button type="submit" className="pay-btn span-3" disabled={criando}>
            {criando ? 'Gerando...' : 'Gerar link'}
          </button>
        </form>

        {erro && <div className="alert error">{erro}</div>}

        {resultado && (
          <div className="link-box">
            <strong>Link da reserva:</strong>
            <div className="link-row">
              <code>{resultado.link}</code>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copiar(resultado.link, 'link-' + resultado.slot.id)}
              >
                {copiadoId === 'link-' + resultado.slot.id ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <strong>Mensagem para WhatsApp:</strong>
            <div className="link-row">
              <textarea
                className="input"
                rows={3}
                readOnly
                value={resultado.mensagem}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copiar(resultado.mensagem, 'msg-' + resultado.slot.id)}
              >
                {copiadoId === 'msg-' + resultado.slot.id ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <a
              className="wa-btn"
              href={resultado.whatsapp_url}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="card admin-card">
        <div className="row-between">
          <h2 className="title-sm">Horários do dia</h2>
          <button type="button" className="btn-secondary" onClick={carregarSlots}>
            {carregandoSlots ? 'Carregando...' : 'Recarregar'}
          </button>
        </div>

        {slots.length === 0 ? (
          <p className="muted">Nenhum slot carregado. Clique em "Recarregar".</p>
        ) : (
          <table className="slots-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Hora</th>
                <th>Status</th>
                <th>Reservado por</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id}>
                  <td>{formatDataBR(s.data)}</td>
                  <td>{s.hora}</td>
                  <td>
                    <span className={`badge ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.reservado_por || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary sm"
                      onClick={() => copiar(s.link, 'row-' + s.id)}
                    >
                      {copiadoId === 'row-' + s.id ? 'Copiado!' : 'Copiar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CuponsAdmin token={token} />
    </div>
  );
}
