const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, { method = 'GET', body, headers } = {}) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Erro ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function calcular({ quantidade, cupons, slotId }) {
  return request('/calcular', {
    method: 'POST',
    body: {
      quantidade,
      cupons: Array.isArray(cupons) ? cupons : [],
      slot_id: slotId || null,
    },
  });
}

export function criarPagamento(payload) {
  return request('/criar-pagamento', { method: 'POST', body: payload });
}

export function getSlot(id) {
  return request(`/slots/${encodeURIComponent(id)}`);
}

export function criarSlot({ data, hora, duracaoMin, precoPorPessoa, adminToken }) {
  return request('/slots', {
    method: 'POST',
    body: {
      data,
      hora,
      duracao_min: duracaoMin,
      preco_por_pessoa: precoPorPessoa,
    },
    headers: adminToken ? { 'x-admin-token': adminToken } : {},
  });
}

export function listarSlots({ data, adminToken } = {}) {
  const qs = data ? `?data=${encodeURIComponent(data)}` : '';
  return request(`/slots${qs}`, {
    headers: adminToken ? { 'x-admin-token': adminToken } : {},
  });
}

export function getReserva(id) {
  return request(`/reservas/${encodeURIComponent(id)}`);
}

export function listarCupons({ adminToken } = {}) {
  return request('/cupons', {
    headers: adminToken ? { 'x-admin-token': adminToken } : {},
  });
}

export function criarCupom({ codigo, tipo, valor, usoMaximo, validade, ativo, adminToken }) {
  return request('/cupons', {
    method: 'POST',
    body: {
      codigo,
      tipo,
      valor,
      uso_maximo: usoMaximo ?? null,
      validade: validade || null,
      ativo: ativo !== false,
    },
    headers: adminToken ? { 'x-admin-token': adminToken } : {},
  });
}

export function atualizarCupom(id, { codigo, tipo, valor, usoMaximo, validade, ativo, adminToken }) {
  const body = {};
  if (codigo !== undefined) body.codigo = codigo;
  if (tipo !== undefined) body.tipo = tipo;
  if (valor !== undefined) body.valor = valor;
  if (usoMaximo !== undefined) body.uso_maximo = usoMaximo;
  if (validade !== undefined) body.validade = validade;
  if (ativo !== undefined) body.ativo = ativo;
  return request(`/cupons/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
    headers: adminToken ? { 'x-admin-token': adminToken } : {},
  });
}

export function deletarCupom(id, { adminToken } = {}) {
  return request(`/cupons/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminToken ? { 'x-admin-token': adminToken } : {},
  });
}
