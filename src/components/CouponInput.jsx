import React, { useState } from 'react';

function formatValor(cupom) {
  if (cupom.tipo === 'percentual') return `${cupom.valor}%`;
  return `R$ ${Number(cupom.valor).toFixed(2)}`;
}

export default function CouponInput({
  cupons,
  onChange,
  cuponsAplicados,
  erroCupom,
  maxCupons,
}) {
  const [valor, setValor] = useState('');

  const atingiuLimite = maxCupons && cupons.length >= maxCupons;

  function adicionar() {
    const codigo = valor.trim().toUpperCase();
    if (!codigo) return;
    if (cupons.includes(codigo)) {
      setValor('');
      return;
    }
    if (atingiuLimite) return;
    onChange([...cupons, codigo]);
    setValor('');
  }

  function remover(codigo) {
    onChange(cupons.filter((c) => c !== codigo));
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionar();
    }
  }

  const aplicadosMap = new Map(
    (cuponsAplicados || []).map((c) => [c.codigo, c])
  );

  return (
    <div className="field">
      <label className="label" htmlFor="cupom">Cupons de desconto</label>
      <div className="coupon-input-row">
        <input
          id="cupom"
          type="text"
          className="input"
          placeholder={
            atingiuLimite
              ? `Máximo de ${maxCupons} cupons atingido`
              : 'Digite o código e clique em Adicionar'
          }
          value={valor}
          onChange={(e) => setValor(e.target.value.toUpperCase())}
          onKeyDown={handleKey}
          maxLength={40}
          disabled={atingiuLimite}
        />
        <button
          type="button"
          className="btn-secondary"
          onClick={adicionar}
          disabled={atingiuLimite || !valor.trim()}
        >
          Adicionar
        </button>
      </div>

      {maxCupons > 0 && (
        <small className="hint">
          Você pode aplicar até <strong>{maxCupons}</strong>{' '}
          {maxCupons === 1 ? 'cupom' : 'cupons'} (um por participante). Cupons
          não podem ser repetidos.
        </small>
      )}

      {cupons.length > 0 && (
        <div className="coupon-chips">
          {cupons.map((codigo) => {
            const aplicado = aplicadosMap.get(codigo);
            return (
              <span
                key={codigo}
                className={`coupon-chip ${aplicado ? 'ok' : 'pending'}`}
              >
                <span className="coupon-chip-code">{codigo}</span>
                {aplicado && (
                  <span className="coupon-chip-value">
                    -{formatValor(aplicado)}
                  </span>
                )}
                <button
                  type="button"
                  className="coupon-chip-remove"
                  onClick={() => remover(codigo)}
                  aria-label={`Remover ${codigo}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {erroCupom && <small className="hint error">{erroCupom}</small>}
    </div>
  );
}
