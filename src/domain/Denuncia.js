'use strict';
const Status = require('./StatusDenuncia');
const { ValidacaoError, TransicaoInvalidaError } = require('./errors');
const DIA_MS = 86400000;

/** Entidade raiz: concentra as regras do ciclo de vida de uma denúncia. */
class Denuncia {
  constructor(dados) { Object.assign(this, dados); }

  static registrar({ protocolo, categoria, localizacao, coordenadas, descricao, cidadaoId, vinculadaA = null, agora }) {
    const loc = String(localizacao ?? '').trim();
    const desc = String(descricao ?? '').trim();
    if (loc.length < 3) throw new ValidacaoError('Informe a localização da ocorrência.');
    if (desc.length < 10) throw new ValidacaoError('Descreva o problema com pelo menos 10 caracteres.');
    if (desc.length > 1000) throw new ValidacaoError('A descrição deve ter no máximo 1000 caracteres.');
    const iso = agora.toISOString();
    return new Denuncia({
      id: protocolo, categoriaId: categoria.id, categoria: categoria.nome, secretaria: categoria.secretaria, prazoDias: categoria.prazoDias,
      localizacao: loc, coordenadas: coordenadas || null, descricao: desc, fotos: [], cidadaoId, vinculadaA,
      status: Status.INICIAL, historico: [{ status: Status.INICIAL, data: iso, observacao: null, autor: cidadaoId }],
      criadaEm: iso, atualizadaEm: iso
    });
  }

  avancar(novoStatus, { observacao, autor, agora }) {
    if (!Status.existe(novoStatus)) throw new ValidacaoError('Status inválido.');
    const proximo = Status.proximo(this.status);
    if (novoStatus !== proximo) {
      throw new TransicaoInvalidaError(proximo ? `A próxima etapa permitida é "${Status.rotulo(proximo)}".` : 'A denúncia já foi concluída.');
    }
    const obs = String(observacao ?? '').trim().slice(0, 300) || null;
    const iso = agora.toISOString();
    this.status = novoStatus;
    this.historico.push({ status: novoStatus, data: iso, observacao: obs, autor });
    this.atualizadaEm = iso;
  }

  get concluida() { return Status.ehFinal(this.status); }
  previsaoConclusao() { return new Date(new Date(this.criadaEm).getTime() + this.prazoDias * DIA_MS).toISOString(); }
  dataConclusao() { const h = this.historico.find((x) => Status.ehFinal(x.status)); return h ? h.data : null; }

  linhaDoTempo() {
    const atual = Status.indice(this.status);
    return Status.todos().map((s, i) => {
      const h = this.historico.find((x) => x.status === s.id);
      const estado = i < atual ? 'feito' : i === atual ? (this.concluida ? 'concluido' : 'atual') : 'pendente';
      const final = Status.ehFinal(s.id);
      return {
        status: s.id, rotulo: s.rotulo, titulo: s.titulo, estado,
        descricao: estado !== 'pendente' || final ? s.descricao(this.secretaria, estado === 'concluido') : null,
        observacao: h ? h.observacao : null, data: h ? h.data : null,
        previsao: !h && final ? this.previsaoConclusao() : null
      };
    });
  }

  /** Dados puros para persistência. */
  dados() { return JSON.parse(JSON.stringify({ ...this })); }
  /** Representação enviada pela API. */
  toJSON() {
    return { ...this.dados(), rotuloStatus: Status.rotulo(this.status), proximoStatus: Status.proximo(this.status), previsaoConclusao: this.previsaoConclusao(), linhaDoTempo: this.linhaDoTempo() };
  }
}
module.exports = { Denuncia };
