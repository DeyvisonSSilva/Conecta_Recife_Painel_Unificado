'use strict';
const Status = require('../domain/StatusDenuncia');
const DIA_MS = 86400000;
/** Indicadores de gestão (tempo de resposta, taxa de resolução, por secretaria etc.). */
class PainelService {
  constructor({ repositorio, catalogo, relogio }) { this.repositorio = repositorio; this.catalogo = catalogo; this.relogio = relogio; }
  async estatisticas() {
    const todas = await this.repositorio.listar({});
    const agora = this.relogio.agora();
    const noMes = (iso) => { const d = new Date(iso); return d.getFullYear() === agora.getFullYear() && d.getMonth() === agora.getMonth(); };
    const concluidas = todas.filter((d) => d.concluida);
    const tempos = concluidas.map((d) => (new Date(d.dataConclusao()) - new Date(d.criadaEm)) / DIA_MS);
    const secretarias = {};
    todas.forEach((d) => { const s = (secretarias[d.secretaria] = secretarias[d.secretaria] || { secretaria: d.secretaria, abertas: 0, concluidas: 0 }); d.concluida ? s.concluidas++ : s.abertas++; });
    return {
      total: todas.length,
      recebidasMes: todas.filter((d) => noMes(d.criadaEm)).length,
      emAndamento: todas.length - concluidas.length,
      concluidasMes: concluidas.filter((d) => noMes(d.dataConclusao())).length,
      taxaResolucao: todas.length ? Math.round((concluidas.length / todas.length) * 100) : 0,
      tempoMedioDias: tempos.length ? Math.round((tempos.reduce((a, b) => a + b, 0) / tempos.length) * 10) / 10 : null,
      porCategoria: this.catalogo.todas().map((c) => ({ categoria: c.nome, total: todas.filter((d) => d.categoriaId === c.id).length })),
      porStatus: Status.todos().map((s) => ({ status: s.id, rotulo: s.rotulo, total: todas.filter((d) => d.status === s.id).length })),
      porSecretaria: Object.values(secretarias)
    };
  }
  async relatorioCsv(gerador) { return gerador.gerar(await this.repositorio.listar({})); }
}
module.exports = { PainelService };
