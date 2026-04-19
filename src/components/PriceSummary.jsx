import React from 'react';
import { formatBRL } from '../utils/format';

export default function PriceSummary({ calculo, carregando }) {
  if (!calculo) {
    return (
      <div className="summary">
        <div className="summary-row">
          <span>Calculando...</span>
        </div>
      </div>
    );
  }

  const {
    quantidade,
    preco_por_pessoa,
    fim_de_semana,
    subtotal,
    desconto_bulk,
    bulk_aplicado,
    desconto_cupom,
    taxa_mp,
    total,
  } = calculo;

  return (
    <div className={`summary ${carregando ? 'loading' : ''}`}>
      <div className="summary-row">
        <span>
          {quantidade}x {formatBRL(preco_por_pessoa)}
          <small className="muted"> · {fim_de_semana ? 'Fim de semana' : 'Dia de semana'}</small>
        </span>
        <strong>{formatBRL(subtotal)}</strong>
      </div>

      {bulk_aplicado && desconto_bulk > 0 && (
        <div className="summary-row discount">
          <span>🎉 Desconto grupo (5+)</span>
          <strong className="muted">já aplicado</strong>
        </div>
      )}

      {desconto_cupom > 0 && (
        <div className="summary-row discount">
          <span>Desconto cupom</span>
          <strong>− {formatBRL(desconto_cupom)}</strong>
        </div>
      )}

      {taxa_mp > 0 && (
        <div className="summary-row">
          <span>
            Taxa de processamento
            <small className="muted"> · Mercado Pago</small>
          </span>
          <strong>{formatBRL(taxa_mp)}</strong>
        </div>
      )}

      <div className="summary-row total">
        <span>Total</span>
        <strong>{formatBRL(total)}</strong>
      </div>
    </div>
  );
}
