import { esc } from './ui.js';
const topo = (direita) => `<header class="hd"><div class="lg"><span class="dot"></span>Conecta Recife</div><div class="lk"><span>Institucional</span><span>Ouvidoria</span><span>Portal da Transparência</span><span>Eventos</span><span>Mapa</span></div>${direita}</header>`;

export function layoutCidadao(aba, conteudo, usuario) {
  const abas = [['inicio', 'Início'], ['minhas', 'Minhas Denúncias'], ['nova', 'Nova Denúncia']];
  return `${topo(`<div class="us">${esc(usuario.nome)} <span class="av"></span><button data-sair>Sair</button></div>`)}
  <nav class="tb" aria-label="Seções">${abas.map(([id, nome]) => `<a href="#/${id}" class="${id === aba ? 'on' : ''}">${nome}</a>`).join('')}</nav>
  <main class="wr">${conteudo}</main>`;
}

export function layoutServidor(aba, conteudo, usuario) {
  const menu = [['painel', '#/painel', '📊', 'Visão Geral'], ['denuncias', '#/painel/denuncias', '📋', 'Denúncias'], ['secretarias', '#/painel/secretarias', '🏢', 'Secretarias'], ['relatorios', '#/painel/relatorios', '📈', 'Relatórios'], ['config', '#/painel/config', '⚙️', 'Configurações']];
  return `${topo('<div></div>')}<div class="ad"><aside class="sb"><div class="br"><span class="dot" style="background:#fff"></span><span>Conecta Recife<small>Painel do Servidor</small></span></div>
  ${menu.map(([id, href, emoji, nome]) => `<a href="${href}" class="${id === aba ? 'on' : ''}"><span aria-hidden="true">${emoji}</span>${nome}</a>`).join('')}
  <div class="me"><span class="av"></span><span>${esc(usuario.nome)}<small>${esc(usuario.setor || 'Servidor Público')}</small></span><button data-sair>Sair</button></div></aside><main class="ac">${conteudo}</main></div>`;
}
