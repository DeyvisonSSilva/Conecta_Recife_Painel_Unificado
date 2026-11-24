import { api } from '../api.js';
import { sessao } from '../sessao.js';
import { layoutServidor } from '../layout.js';
import { esc, badge, fmtData } from '../ui.js';

const pagina = (aba, html) => layoutServidor(aba, html, sessao.usuario);
const vazio = '<div class="vazio">Nenhuma denúncia registrada ainda.</div>';
const tabela = (lista) => lista.length ? `<div class="tw"><table><thead><tr><th>Protocolo</th><th>Categoria</th><th>Secretaria</th><th>Registrada em</th><th>Status</th><th>Ação</th></tr></thead><tbody>
  ${lista.map((d) => `<tr><td>#${esc(d.id)}</td><td>${esc(d.categoria)}</td><td class="gy">${esc(d.secretaria)}</td><td class="gy">${fmtData(d.criadaEm)}</td><td>${badge(d)}</td><td><a class="lkb" href="#/painel/denuncia/${esc(d.id)}">Ver →</a></td></tr>`).join('')}</tbody></table></div>` : vazio;
const card = (rotulo, valor, cor) => `<div class="cd"><small>${rotulo}</small><b style="color:${cor || 'var(--ink)'}">${valor}</b></div>`;
const dias = (n) => (n === null ? '—' : `${String(n).replace('.', ',')} dias`);

export async function geral() {
  const [st, lista] = await Promise.all([api.get('/api/painel/estatisticas'), api.get('/api/denuncias')]);
  const html = `<div class="row"><div><h2 style="font-size:17px">Fila de Denúncias</h2><small>Todas as ocorrências recebidas via Conecta Recife, unificadas em um só painel</small></div><button class="btn o" id="exportar" style="color:var(--br)">Exportar Relatório</button></div>
    <div class="st">${card('Recebidas (mês)', st.recebidasMes, '#3b7de0')}${card('Em Andamento', st.emAndamento, '#e8890c')}${card('Concluídas (mês)', st.concluidasMes, '#16a34a')}${card('Tempo Médio', dias(st.tempoMedioDias))}</div>${tabela(lista)}`;
  return { html: pagina('painel', html), depois: ligarExportar };
}

export async function denuncias() {
  const [categorias, status] = [await api.get('/api/categorias'), ['RECEBIDA:Recebida', 'EM_ANALISE:Em Análise', 'ENCAMINHADA:Encaminhada', 'EM_EXECUCAO:Em Execução', 'CONCLUIDA:Concluída']];
  const html = `<h2 style="font-size:17px">Denúncias</h2><small>Pesquise e filtre todas as ocorrências.</small>
    <div class="flt"><input id="q" class="fi" type="search" placeholder="Buscar por protocolo, local ou descrição" aria-label="Buscar">
    <select id="st" class="fi" aria-label="Status"><option value="">Todos os status</option>${status.map((s) => `<option value="${s.split(':')[0]}">${s.split(':')[1]}</option>`).join('')}</select>
    <select id="cat" class="fi" aria-label="Categoria"><option value="">Todas as categorias</option>${categorias.map((c) => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('')}</select></div><div id="res"></div>`;
  return {
    html: pagina('denuncias', html),
    depois(root) {
      const buscar = async () => {
        const p = new URLSearchParams(); const v = (s) => root.querySelector(s).value;
        if (v('#q')) p.set('busca', v('#q')); if (v('#st')) p.set('status', v('#st')); if (v('#cat')) p.set('categoriaId', v('#cat'));
        root.querySelector('#res').innerHTML = tabela(await api.get(`/api/denuncias?${p}`));
      };
      let t; root.querySelector('#q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(buscar, 250); });
      root.querySelector('#st').addEventListener('change', buscar); root.querySelector('#cat').addEventListener('change', buscar); buscar();
    }
  };
}

export async function secretarias() {
  const st = await api.get('/api/painel/estatisticas');
  const html = `<h2 style="font-size:17px">Secretarias</h2><small>Demandas por órgão responsável.</small>
    ${st.porSecretaria.length ? `<div class="st">${st.porSecretaria.map((s) => `<div class="cd"><h3>Secretaria de ${esc(s.secretaria)}</h3><b>${s.abertas}</b><small>em aberto · ${s.concluidas} concluídas</small></div>`).join('')}</div>` : vazio}`;
  return { html: pagina('secretarias', html) };
}

export async function relatorios() {
  const st = await api.get('/api/painel/estatisticas');
  const max = Math.max(1, st.total);
  const barras = (itens) => itens.map(([nome, n]) => `<div style="margin-top:12px"><div class="row"><span>${esc(nome)}</span><b>${n}</b></div><div class="bar" style="width:${Math.round((n / max) * 100)}%"></div></div>`).join('');
  const html = `<div class="row"><div><h2 style="font-size:17px">Relatórios</h2><small>Total: ${st.total} · Taxa de resolução: ${st.taxaResolucao}% · Tempo médio: ${dias(st.tempoMedioDias)}</small></div><button class="btn o" id="exportar" style="color:var(--br)">Exportar Relatório</button></div>
    <div class="st"><div class="cd"><h3>Por categoria</h3>${barras(st.porCategoria.map((c) => [c.categoria, c.total]))}</div><div class="cd"><h3>Por status</h3>${barras(st.porStatus.map((s) => [s.rotulo, s.total]))}</div></div>`;
  return { html: pagina('relatorios', html), depois: ligarExportar };
}

export async function config() {
  const { armazenamento } = await api.get('/api/sistema'); const u = sessao.usuario;
  const html = `<h2 style="font-size:17px">Configurações</h2><div class="st"><div class="cd kv"><h3>Conta</h3><small>Nome</small><b>${esc(u.nome)}</b><small>Matrícula</small><b>${esc(u.id)}</b><small>Setor</small><b>${esc(u.setor || '—')}</b></div>
    <div class="cd kv"><h3>Sistema</h3><small>Armazenamento de dados</small><b>${esc(armazenamento)}</b><small>Fluxo de status</small><b>Recebida › Em Análise › Encaminhada › Em Execução › Concluída</b></div></div>`;
  return { html: pagina('config', html) };
}

function ligarExportar(root) {
  const b = root.querySelector('#exportar'); if (!b) return;
  b.addEventListener('click', async () => {
    const blob = await api.get('/api/painel/relatorio.csv');
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio-denuncias.csv'; a.click(); URL.revokeObjectURL(a.href);
  });
}
