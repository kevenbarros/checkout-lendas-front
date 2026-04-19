import React from 'react';
import { formatBRL } from '../utils/format';

const MIN = 2;
const MAX = 7;

export default function ParticipantSelector({
  value,
  onChange,
  precoPorPessoa,
  precoPorPessoaBase,
  bulkAplicado,
  bulkMinQtd = 5,
  bulkValorPorPessoa = 5,
}) {
  const decrement = () => onChange(Math.max(MIN, value - 1));
  const increment = () => onChange(Math.min(MAX, value + 1));

  const mostrarPreco = typeof precoPorPessoa === 'number';
  const mostrarRiscado =
    bulkAplicado &&
    typeof precoPorPessoaBase === 'number' &&
    precoPorPessoaBase > precoPorPessoa;

  const faltamPessoas = Math.max(0, bulkMinQtd - value);

  return (
    <div className="field">
      <label className="label">Participantes</label>
      <div className="participant-row">
        <div className="stepper">
          <button
            type="button"
            className="stepper-btn"
            onClick={decrement}
            disabled={value <= MIN}
            aria-label="Diminuir"
          >
            −
          </button>
          <span className="stepper-value">{value}</span>
          <button
            type="button"
            className="stepper-btn"
            onClick={increment}
            disabled={value >= MAX}
            aria-label="Aumentar"
          >
            +
          </button>
        </div>

        {mostrarPreco && (
          <div className={`price-pill ${bulkAplicado ? 'discount' : ''}`}>
            <span className="price-pill-label">por pessoa</span>
            <span className="price-pill-value">
              {mostrarRiscado && (
                <s className="price-pill-old">{formatBRL(precoPorPessoaBase)}</s>
              )}
              <strong>{formatBRL(precoPorPessoa)}</strong>
            </span>
          </div>
        )}
      </div>

      {bulkAplicado ? (
        <div className="bulk-badge">
          🎉 Desconto automático aplicado: R${bulkValorPorPessoa} OFF por pessoa
          (grupo de {bulkMinQtd}+)
        </div>
      ) : (
        faltamPessoas > 0 && (
          <div className="bulk-hint">
            💡 Adicione mais {faltamPessoas === 1 ? '1 pessoa' : `${faltamPessoas} pessoas`} e ganhe
            R${bulkValorPorPessoa} OFF por pessoa
          </div>
        )
      )}

      <small className="hint">mínimo {MIN} · máximo {MAX}</small>
    </div>
  );
}
