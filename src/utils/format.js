export function formatBRL(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function maskCpf(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatDataBR(dataISO) {
  if (!dataISO) return '';
  const [y, m, d] = dataISO.split('-');
  return `${d}/${m}/${y}`;
}

export function diaDaSemana(dataISO) {
  if (!dataISO) return '';
  const [y, m, d] = dataISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('pt-BR', { weekday: 'long' });
}
