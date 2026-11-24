import { api } from '../api.js';
import { sessao } from '../sessao.js';
import { layoutCidadao, layoutServidor } from '../layout.js';
import { esc, ic, badge, fmtData, fmtDataHora, toast } from '../ui.js';

const CLASSE = { feito: 'd', atual: 'c', concluido: 'g2', pendente: 'p' };
function linha(e) {
  const data = e.data ? fmtDataHora(e.data) : e.previsao ? `Previsão: ${fmtData(e.previsao)}` : '';
  return `<li class="${CLASSE[e.estado]}"><span class="dc">${e.estado === 'atual' || e.estado === 'concluido' ? ic('check', 10, 3.5) : ''}</span><b>${esc(e.titulo)}</b>${e.descricao ? esc(e.descricao) : ''}${e.observacao ? `<small class="obs">Obs.: ${esc(e.observacao)}</small>` : ''}${data ? `<small>${data}</small>` : ''}</li>`;
}

export async function detalhe({ params, recarregar }) {
  const d = await api.get(`/api/denuncias/${params[0]}`);
  const usuario = sessao.usuario; const servidor = usuario.papel === 'servidor';
  const proximo = d.linhaDoTempo.find((e) => e.status === d.proximoStatus);
  const acao = !servidor ? '' : `<div class="cd" style="margin-top:16px"><h3>Atualizar andamento</h3>${proximo
    ? `<label for="obs">Observação (opcional – visível ao cidadão)</label><textarea id="obs" class="fi" maxlength="300"></textarea><p class="erro" id="erro" role="alert" hidden></p><button class="btn" id="avancar" style="margin-top:10px">Avançar para "${esc(proximo.rotulo)}"</button>`
    : '<p class="mu" style="margin:8px 0 0">Esta denúncia já foi concluída.</p>'}</div>`;
  const fotos = d.fotos.length ? `<small>Fotos</small><div class="fotos">${d.fotos.map((f) => `<a href="${esc(f)}" target="_blank" rel="noopener"><img class="foto" alt="Foto da ocorrência" src="${esc(f)}"></a>`).join('')}</div>` : '';
  const html = `<a class="lkb" href="${servidor ? '#/painel' : '#/minhas'}" style="font-weight:500;font-size:10px">← Voltar para ${servidor ? 'a fila' : 'Minhas Denúncias'}</a>
    <div class="row" style="margin-top:16px"><div><h2>${esc(d.categoria)}</h2><small>Protocolo #${esc(d.id)} · ${esc(d.localizacao)}</small></div>${badge(d)}</div>
    <div class="two"><div class="cd" style="padding:18px 22px"><h3>Linha do Tempo</h3><ul class="tl">${d.linhaDoTempo.map(linha).join('')}</ul></div>
    <div class="cd kv"><h3>Detalhes da Solicitação</h3><small>Categoria</small><b>${esc(d.categoria)}</b><small>Órgão Responsável</small><b>Secretaria de ${esc(d.secretaria)}</b><small>Localização</small><b>${esc(d.localizacao)}</b>
    <small>Registrada em</small><b>${fmtData(d.criadaEm)}</b><small>Última atualização</small><b>${fmtData(d.atualizadaEm)}</b>${d.vinculadaA ? `<small>Vinculada ao protocolo</small><b>#${esc(d.vinculadaA)}</b>` : ''}
    <hr><small>Descrição enviada pelo cidadão</small><span style="display:block;margin-top:8px;font-size:10.5px">${esc(d.descricao)}</span>${fotos}</div></div>${acao}`;
  return {
    html: servidor ? layoutServidor('painel', html, usuario) : layoutCidadao('minhas', html, usuario),
    depois(root) {
      const botao = root.querySelector('#avancar'); if (!botao) return;
      botao.addEventListener('click', async () => {
        botao.disabled = true;
        try { await api.patch(`/api/denuncias/${d.id}/status`, { status: d.proximoStatus, observacao: root.querySelector('#obs').value }); toast('Andamento atualizado. O cidadão foi notificado.'); recarregar(); }
        catch (x) { const e = root.querySelector('#erro'); e.textContent = x.message; e.hidden = false; botao.disabled = false; }
      });
    }
  };
}
