import React, { useEffect, useState } from 'react';
import {
  listarCupons,
  criarCupom,
  atualizarCupom,
  deletarCupom,
} from '../services/api';
import { formatDataBR } from '../utils/format';

const FORM_INICIAL = {
  codigo: '',
  tipo: 'fixo',
  valor: '',
  usoMaximo: '1',
  validade: '',
  ativo: true,
};

function formatValor(cupom) {
  if (cupom.tipo === 'percentual') return `${cupom.valor}%`;
  return `R$ ${Number(cupom.valor).toFixed(2)}`;
}

export default function CuponsAdmin({ token }) {
  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function carregar() {
    if (!token) {
      setErro('Informe o token de administrador acima.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const resp = await listarCupons({ adminToken: token });
      setCupons(resp.cupons || []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (token) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function limparForm() {
    setForm(FORM_INICIAL);
    setEditandoId(null);
  }

  function iniciarEdicao(cupom) {
    setEditandoId(cupom.id);
    setForm({
      codigo: cupom.codigo || '',
      tipo: cupom.tipo || 'fixo',
      valor: String(cupom.valor ?? ''),
      usoMaximo:
        cupom.uso_maximo === null || cupom.uso_maximo === undefined
          ? ''
          : String(cupom.uso_maximo),
      validade: cupom.validade || '',
      ativo: cupom.ativo !== false,
    });
    setMensagem('');
    setErro('');
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!token) {
      setErro('Informe o token de administrador acima.');
      return;
    }
    if (!form.codigo.trim()) {
      setErro('Informe o código do cupom.');
      return;
    }
    const valorNum = Number(form.valor);
    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      setErro('Informe um valor válido (maior que 0).');
      return;
    }
    if (form.tipo === 'percentual' && valorNum > 100) {
      setErro('Percentual não pode ser maior que 100.');
      return;
    }
    const usoMaximo =
      form.usoMaximo === '' || form.usoMaximo === null
        ? null
        : Number(form.usoMaximo);
    if (usoMaximo !== null && (!Number.isInteger(usoMaximo) || usoMaximo < 1)) {
      setErro('Uso máximo deve ser um inteiro maior que 0 (ou vazio para ilimitado).');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId) {
        await atualizarCupom(editandoId, {
          codigo: form.codigo.trim(),
          tipo: form.tipo,
          valor: valorNum,
          usoMaximo,
          validade: form.validade || null,
          ativo: form.ativo,
          adminToken: token,
        });
        setMensagem('Cupom atualizado.');
      } else {
        await criarCupom({
          codigo: form.codigo.trim(),
          tipo: form.tipo,
          valor: valorNum,
          usoMaximo,
          validade: form.validade || null,
          ativo: form.ativo,
          adminToken: token,
        });
        setMensagem('Cupom criado.');
      }
      limparForm();
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(cupom) {
    if (!window.confirm(`Excluir cupom ${cupom.codigo}?`)) return;
    setErro('');
    setMensagem('');
    try {
      await deletarCupom(cupom.id, { adminToken: token });
      setMensagem('Cupom excluído.');
      if (editandoId === cupom.id) limparForm();
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function toggleAtivo(cupom) {
    try {
      await atualizarCupom(cupom.id, {
        ativo: !cupom.ativo,
        adminToken: token,
      });
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="card admin-card">
      <div className="row-between">
        <h2 className="title-sm">Cupons de desconto</h2>
        <button type="button" className="btn-secondary" onClick={carregar}>
          {carregando ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      <form onSubmit={handleSalvar} className="grid-3">
        <div className="field">
          <label className="label">Código</label>
          <input
            type="text"
            className="input"
            value={form.codigo}
            onChange={(e) => atualizar('codigo', e.target.value.toUpperCase())}
            placeholder="Ex: LENDAS10"
            maxLength={40}
            required
          />
        </div>

        <div className="field">
          <label className="label">Tipo</label>
          <select
            className="input"
            value={form.tipo}
            onChange={(e) => atualizar('tipo', e.target.value)}
          >
            <option value="fixo">Fixo (R$)</option>
            <option value="percentual">Percentual (%)</option>
          </select>
        </div>

        <div className="field">
          <label className="label">
            Valor {form.tipo === 'percentual' ? '(%)' : '(R$)'}
          </label>
          <input
            type="number"
            className="input"
            value={form.valor}
            step="0.01"
            min="0"
            onChange={(e) => atualizar('valor', e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label">Uso máximo</label>
          <input
            type="number"
            className="input"
            value={form.usoMaximo}
            min="1"
            step="1"
            onChange={(e) => atualizar('usoMaximo', e.target.value)}
            placeholder="Deixe vazio para ilimitado"
          />
          <small className="hint">1 = cupom morre após 1 uso. Vazio = ilimitado.</small>
        </div>

        <div className="field">
          <label className="label">Validade (opcional)</label>
          <input
            type="date"
            className="input"
            value={form.validade}
            onChange={(e) => atualizar('validade', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Ativo</label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => atualizar('ativo', e.target.checked)}
            />
            <span>Cupom disponível para uso</span>
          </label>
        </div>

        <div className="span-3 btn-row">
          <button type="submit" className="pay-btn" disabled={salvando}>
            {salvando
              ? 'Salvando...'
              : editandoId
              ? 'Salvar alterações'
              : 'Criar cupom'}
          </button>
          {editandoId && (
            <button type="button" className="btn-secondary" onClick={limparForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {erro && <div className="alert error">{erro}</div>}
      {mensagem && <div className="alert success">{mensagem}</div>}

      {cupons.length === 0 ? (
        <p className="muted">Nenhum cupom cadastrado.</p>
      ) : (
        <table className="slots-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Usos</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.codigo}</strong>
                </td>
                <td>{c.tipo === 'percentual' ? '%' : 'R$'}</td>
                <td>{formatValor(c)}</td>
                <td>
                  {c.usos || 0}
                  {c.uso_maximo ? ` / ${c.uso_maximo}` : ' / ∞'}
                </td>
                <td>{c.validade ? formatDataBR(c.validade) : '—'}</td>
                <td>
                  {!c.ativo && <span className="badge cancelado">Inativo</span>}
                  {c.ativo && c.esgotado && (
                    <span className="badge cancelado">Esgotado</span>
                  )}
                  {c.ativo && c.expirado && !c.esgotado && (
                    <span className="badge cancelado">Expirado</span>
                  )}
                  {c.ativo && !c.esgotado && !c.expirado && (
                    <span className="badge confirmado">Ativo</span>
                  )}
                </td>
                <td className="actions-cell">
                  <button
                    type="button"
                    className="btn-secondary sm"
                    onClick={() => iniciarEdicao(c)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-secondary sm"
                    onClick={() => toggleAtivo(c)}
                  >
                    {c.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary sm danger"
                    onClick={() => handleDeletar(c)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
