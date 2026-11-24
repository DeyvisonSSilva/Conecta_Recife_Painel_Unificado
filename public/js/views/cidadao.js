import { api } from '../api.js';
import { sessao } from '../sessao.js';
import { layoutCidadao } from '../layout.js';
import { esc, ic, visual, badge, emAberto, fmtData, fmtDataHora, toast } from '../ui.js';

const item = (d) => `<a class="it" href="#/denuncia/${esc(d.id)}"><span class="sq ${visual(d.categoriaId)[1]}"></span><span class="gr"><b>${esc(d.categoria)}</b><small>Protocolo #${esc(d.id)} · Registrada em ${fmtData(d.criadaEm)}</small></span>${badge(d)}<span class="lkb" style="font-weight:500">Ver detalhes →</span></a>`;
const vazio = (txt) => `<div class="vazio">${txt}</div>`;
const mesmoMes = (iso) => { const a = new Date(iso); const h = new Date(); return a.getFullYear() === h.getFullYear() && a.getMonth() === h.getMonth(); };

export async function inicio() {
  const [lista, notificacoes] = await Promise.all([api.get('/api/denuncias'), api.get('/api/notificacoes')]);
  const abertas = lista.filter(emAberto);
  const semana = Date.now() - 7 * 86400000;
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  const recentes = [...lista].sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm)).slice(0, 2);
  const card = (rotulo, n, sub) => `<div class="cd"><small>${rotulo}</small><b>${n}</b><small>${sub}</small></div>`;
  const acao = (href, icone, titulo, sub, extra = '') => `<a class="it" href="${href}"><span class="ic b" style="width:24px;height:24px">${ic(icone, 12)}</span><span class="gr"><b style="font-size:10px">${titulo}${extra}</b><small style="font-size:8.5px">${sub}</small></span><span style="color:var(--pr)">${ic('chev', 11, 2.5)}</span></a>`;
  const html = `<div class="hero"><div style="padding-top:22px"><span class="chip">Bem-vindo, ${esc(sessao.usuario.nome)}</span>
    <h1 style="margin:10px 0 6px;font-size:19px">Seu portal de acompanhamento de denúncias</h1>
    <p class="mu" style="margin:0 0 14px;font-size:10px">Veja o resumo das suas solicitações, acompanhe o andamento e registre novas ocorrências com rapidez.</p>
    <a class="btn" href="#/nova">Nova Denúncia</a> <a class="btn o" href="#/minhas" style="margin-left:4px">Minhas Denúncias</a></div>
    <div class="cd qa"><h3>Ações rápidas</h3>${acao('#/nova', 'pin', 'Registrar ocorrência', 'Abra a tela de nova denúncia')}${acao('#/notificacoes', 'bell', 'Ver notificações', 'Acompanhe atualizações recentes', naoLidas ? `<span class="nb">${naoLidas}</span>` : '')}${acao('#/minhas', 'file', 'Ver histórico', 'Consulte todas as suas solicitações')}</div></div>
    <div class="st">${card('Denúncias registradas', lista.length, `${abertas.filter((d) => mesmoMes(d.criadaEm)).length} em andamento neste mês`)}${card('Em andamento', abertas.length, `${abertas.filter((d) => new Date(d.atualizadaEm) > semana).length} com atualização nos últimos 7 dias`)}${card('Concluídas', lista.length - abertas.length, `${lista.length - abertas.length} finalizadas com sucesso`)}</div>
    <div class="row"><div><h3 style="font-size:12px">Atualizações recentes</h3><small style="font-size:9.5px">Acompanhe o andamento das suas solicitações</small></div><a class="btn o pill" href="#/minhas" style="font-size:10px">Ver todas</a></div>
    ${recentes.length ? recentes.map((d) => `<a class="it" href="#/denuncia/${esc(d.id)}"><span class="ic ${visual(d.categoriaId)[1]}">${ic(visual(d.categoriaId)[0], 14)}</span><span class="gr"><b>${esc(d.categoria)}</b><small>Protocolo #${esc(d.id)} · ${esc(d.localizacao.replace(' - ', ' · '))}</small></span><span style="text-align:right">${badge(d)}<br><small style="font-size:9px">${fmtData(d.atualizadaEm)}</small></span></a>`).join('') : vazio('Você ainda não registrou nenhuma denúncia. Clique em <b>Nova Denúncia</b> para começar.')}`;
  return { html: layoutCidadao('inicio', html, sessao.usuario) };
}

export async function minhas() {
  const lista = await api.get('/api/denuncias');
  const filtros = [['Todas', () => true], ['Em andamento', emAberto], ['Concluídas', (d) => !emAberto(d)]];
  const html = `<div class="row"><div><h2 style="font-size:17px">Minhas Denúncias</h2><small>Acompanhe o status de todas as suas solicitações.</small></div><a class="btn" href="#/nova">+ Nova Denúncia</a></div>
    <div class="chips" id="chips">${filtros.map(([nome], i) => `<button data-i="${i}" class="${i === 0 ? 'on' : ''}">${nome}${i === 0 ? ` (${lista.length})` : ''}</button>`).join('')}</div><div id="lista"></div>`;
  return {
    html: layoutCidadao('minhas', html, sessao.usuario),
    depois(root) {
      const desenhar = (i) => {
        const itens = lista.filter(filtros[i][1]);
        root.querySelector('#lista').innerHTML = itens.length ? itens.map(item).join('') : vazio(lista.length ? 'Nenhuma denúncia neste filtro.' : 'Você ainda não registrou nenhuma denúncia.');
        root.querySelectorAll('#chips button').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === i));
      };
      root.querySelector('#chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) desenhar(Number(b.dataset.i)); });
      desenhar(0);
    }
  };
}

export async function nova() {
  const categorias = await api.get('/api/categorias');
  const html = `<div style="max-width:620px;margin:0 auto"><h2 style="font-size:18px;margin-top:6px">Registrar Nova Denúncia</h2><small style="font-size:9.5px">Preencha os dados abaixo. Você poderá acompanhar o andamento pelo protocolo gerado.</small>
    <form class="cd" id="f" novalidate style="margin-top:14px;padding:6px 16px 16px">
    <label for="cat">Categoria da Denúncia</label><select id="cat" class="fi"><option value="">Selecione: Buraco na via, iluminação, Entulho, Poda de árvore...</option>${categorias.map((c) => `<option value="${esc(c.id)}" data-sec="${esc(c.secretaria)}">${esc(c.nome)}</option>`).join('')}</select><small id="sec" style="display:block;margin-top:6px"></small>
    <label for="loc">Localização</label><input id="loc" class="fi" type="text" maxlength="200" placeholder="📍 Digite o endereço ou selecione no mapa">
    <div class="map" id="map" tabindex="0" role="button" aria-label="Selecionar ponto no mapa">🗺️&nbsp; Selecionar ponto no mapa</div>
    <label for="dsc">Descrição da Ocorrência</label><textarea id="dsc" class="fi" maxlength="1000" placeholder="Descreva o problema com detalhes (local de referência, situação, riscos)..."></textarea>
    <label for="fotos">Fotos (opcional)</label><label class="ft" for="fotos" id="rotFotos">📷 Clique para anexar fotos</label><input id="fotos" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden><div class="fotos" id="previas"></div>
    <div id="aviso"></div><p class="erro" id="erro" role="alert" hidden></p>
    <div class="row" style="justify-content:flex-end;margin-top:16px;gap:8px"><a class="btn o" href="#/minhas">Cancelar</a><button class="btn" id="enviar" type="submit">Enviar Denúncia</button></div></form></div>`;
  return {
    html: layoutCidadao('nova', html, sessao.usuario),
    depois(root) {
      const $ = (s) => root.querySelector(s);
      const est = { coordenadas: null, fotos: [] };
      const mostrarErro = (m) => { $('#erro').textContent = m; $('#erro').hidden = !m; };
      const atualizarSecretaria = () => { const o = $('#cat').selectedOptions[0]; $('#sec').innerHTML = o && o.value ? `Será encaminhada para: <b>Secretaria de ${esc(o.dataset.sec)}</b>` : ''; };
      async function checarDuplicidade() {
        const cat = $('#cat').value; const loc = $('#loc').value;
        if (!cat || loc.trim().length < 5) { $('#aviso').innerHTML = ''; return; }
        try {
          const { duplicada } = await api.get(`/api/denuncias/duplicidade?categoriaId=${encodeURIComponent(cat)}&localizacao=${encodeURIComponent(loc)}`);
          $('#aviso').innerHTML = duplicada ? `<div class="wn">Já existe uma denúncia aberta parecida (<b>#${esc(duplicada.id)}</b> – ${esc(duplicada.rotuloStatus)}). A sua será vinculada a ela para evitar duplicidade.</div>` : '';
        } catch { /* aviso é opcional */ }
      }
      $('#cat').addEventListener('change', () => { atualizarSecretaria(); checarDuplicidade(); });
      $('#loc').addEventListener('change', checarDuplicidade);
      $('#dsc').addEventListener('blur', async () => {
        if ($('#cat').value || $('#dsc').value.trim().length < 10) return;
        try {
          const { categoria } = await api.post('/api/classificacao', { descricao: $('#dsc').value });
          if (categoria) { $('#cat').value = categoria.id; atualizarSecretaria(); checarDuplicidade(); toast(`Categoria sugerida: ${categoria.nome}`); }
        } catch { /* sugestão é opcional */ }
      });
      $('#map').addEventListener('click', (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        est.coordenadas = { x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) };
        $('#map').innerHTML = `<div class="pin" style="left:${est.coordenadas.x}%;top:${est.coordenadas.y}%"></div>`;
      });
      $('#fotos').addEventListener('change', async (e) => {
        mostrarErro(''); const arquivos = [...e.target.files];
        if (arquivos.length > 3) { mostrarErro('Envie no máximo 3 fotos.'); return; }
        if (arquivos.some((a) => a.size > 2 * 1024 * 1024)) { mostrarErro('Cada foto pode ter no máximo 2 MB.'); return; }
        est.fotos = await Promise.all(arquivos.map((a) => new Promise((ok) => { const l = new FileReader(); l.onload = () => ok(l.result); l.readAsDataURL(a); })));
        $('#rotFotos').textContent = est.fotos.length ? `📷 ${est.fotos.length} foto(s) anexada(s)` : '📷 Clique para anexar fotos';
        $('#previas').innerHTML = est.fotos.map((f) => `<img class="foto" alt="Prévia" src="${f}">`).join('');
      });
      $('#f').addEventListener('submit', async (e) => {
        e.preventDefault(); mostrarErro(''); $('#enviar').disabled = true;
        try {
          const d = await api.post('/api/denuncias', { categoriaId: $('#cat').value || undefined, localizacao: $('#loc').value, descricao: $('#dsc').value, coordenadas: est.coordenadas, fotos: est.fotos });
          location.hash = `#/confirmacao/${d.id}`;
        } catch (x) { mostrarErro(x.message); $('#enviar').disabled = false; }
      });
    }
  };
}

export async function confirmacao({ params }) {
  const d = await api.get(`/api/denuncias/${params[0]}`);
  return { html: `<div class="cfp"><div class="cfc"><div class="ok">${ic('check', 16, 3)}</div><h3>Denúncia registrada com sucesso!</h3>
    <small>Sua solicitação foi recebida e encaminhada para a secretaria responsável. Acompanhe o status pelo protocolo abaixo.</small>
    <div class="pt"><small>PROTOCOLO</small>#${esc(d.id)}</div><a class="btn w" href="#/denuncia/${esc(d.id)}" style="font-size:10px;padding:8px;text-align:center">Acompanhar Denúncia</a></div></div>` };
}

export async function notificacoes() {
  const lista = await api.get('/api/notificacoes');
  if (lista.some((n) => !n.lida)) await api.post('/api/notificacoes/lidas');
  const html = `<h2 style="font-size:17px">Notificações</h2><small>Atualizações das suas denúncias.</small>
    ${lista.length ? lista.map((n) => `<a class="it" href="#/denuncia/${esc(n.denunciaId)}" style="${n.lida ? '' : 'border-color:var(--br)'}"><span class="ic b">${ic('bell', 14)}</span><span class="gr"><b>${esc(n.mensagem)}</b><small>${fmtDataHora(n.criadaEm)}</small></span>${n.lida ? '' : '<span class="bd b">Nova</span>'}</a>`).join('') : vazio('Você não tem notificações.')}`;
  return { html: layoutCidadao('inicio', html, sessao.usuario) };
}
