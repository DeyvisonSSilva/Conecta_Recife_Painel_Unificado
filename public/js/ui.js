export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR');
export const fmtDataHora = (iso) => { const d = new Date(iso); return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`; };
const ICONES = {
  sl: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  tree: '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>'
};
export const ic = (n, z = 14, w = 2) => `<svg width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n]}</svg>`;
const VISUAL_CATEGORIA = { BURACO_VIA: ['sl', 'a'], ILUMINACAO: ['bulb', 'p'], ENTULHO: ['trash', 'v'], PODA: ['tree', 'b'] };
export const visual = (categoriaId) => VISUAL_CATEGORIA[categoriaId] || ['file', 'b'];
const COR_STATUS = { RECEBIDA: 'g', EM_ANALISE: 'b', ENCAMINHADA: 'p', EM_EXECUCAO: 'a', CONCLUIDA: 'v' };
export const badge = (d) => `<span class="bd ${COR_STATUS[d.status]}">${esc(d.rotuloStatus)}</span>`;
export const emAberto = (d) => d.status !== 'CONCLUIDA';
let temporizador;
export function toast(msg) {
  const e = document.getElementById('ts'); e.textContent = msg; e.style.display = 'block';
  clearTimeout(temporizador); temporizador = setTimeout(() => { e.style.display = 'none'; }, 3000);
}
