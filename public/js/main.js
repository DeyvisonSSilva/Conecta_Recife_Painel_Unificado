import { sessao } from './sessao.js';
import { esc } from './ui.js';
import { login, loginServidor } from './views/login.js';
import { inicio, minhas, nova, confirmacao, notificacoes } from './views/cidadao.js';
import { detalhe } from './views/detalhe.js';
import { geral, denuncias, secretarias, relatorios, config } from './views/servidor.js';

// [padrão da rota, tela, papel exigido (null = pública, '*' = qualquer logado)]
const ROTAS = [
  [/^#\/login$/, login, null], [/^#\/servidor$/, loginServidor, null],
  [/^#\/inicio$/, inicio, 'cidadao'], [/^#\/minhas$/, minhas, 'cidadao'], [/^#\/nova$/, nova, 'cidadao'],
  [/^#\/confirmacao\/([\w-]+)$/, confirmacao, 'cidadao'], [/^#\/notificacoes$/, notificacoes, 'cidadao'],
  [/^#\/denuncia\/([\w-]+)$/, detalhe, '*'], [/^#\/painel\/denuncia\/([\w-]+)$/, detalhe, 'servidor'],
  [/^#\/painel$/, geral, 'servidor'], [/^#\/painel\/denuncias$/, denuncias, 'servidor'],
  [/^#\/painel\/secretarias$/, secretarias, 'servidor'], [/^#\/painel\/relatorios$/, relatorios, 'servidor'], [/^#\/painel\/config$/, config, 'servidor']
];
const raiz = document.getElementById('app');
const inicial = (u) => (u.papel === 'servidor' ? '#/painel' : '#/inicio');
let versao = 0;

async function renderizar(rolar = true) {
  const meu = ++versao; const hash = location.hash || '#/login'; const u = sessao.usuario;
  const rota = ROTAS.find(([re]) => re.test(hash));
  if (!rota) { location.hash = u ? inicial(u) : '#/login'; return; }
  const [re, tela, papel] = rota;
  if (papel && !u) { location.hash = '#/login'; return; }
  if (!papel && u) { location.hash = inicial(u); return; }
  if (papel && papel !== '*' && u.papel !== papel) { location.hash = inicial(u); return; }
  try {
    const { html, depois } = await tela({ params: hash.match(re).slice(1), recarregar: () => renderizar(false) });
    if (meu !== versao) return;
    raiz.innerHTML = html; if (rolar) window.scrollTo(0, 0); if (depois) depois(raiz);
  } catch (e) {
    if (meu === versao) raiz.innerHTML = `<div class="wr"><p class="wn" role="alert">${esc(e.message)}</p><p><a class="lkb" href="${u ? inicial(u) : '#/login'}">← Voltar</a></p></div>`;
  }
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-sair]')) { sessao.limpar(); location.hash = '#/login'; renderizar(); } });
window.addEventListener('hashchange', () => renderizar());
renderizar();
