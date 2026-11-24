import { sessao } from './sessao.js';
async function requisitar(metodo, url, corpo) {
  const r = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(sessao.token ? { Authorization: `Bearer ${sessao.token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  if (r.status === 204) return null;
  const dados = (r.headers.get('content-type') || '').includes('json') ? await r.json() : await r.blob();
  if (!r.ok) {
    if (r.status === 401 && sessao.token) { sessao.limpar(); location.hash = '#/login'; }
    throw new Error((dados && dados.erro) || 'Erro inesperado. Tente novamente.');
  }
  return dados;
}
export const api = {
  get: (url) => requisitar('GET', url),
  post: (url, corpo) => requisitar('POST', url, corpo || {}),
  patch: (url, corpo) => requisitar('PATCH', url, corpo || {})
};
