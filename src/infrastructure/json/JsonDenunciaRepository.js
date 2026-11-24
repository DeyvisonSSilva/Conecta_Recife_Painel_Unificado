'use strict';
const { DenunciaRepository } = require('../DenunciaRepository');
const { Denuncia } = require('../../domain/Denuncia');
const { normalizar } = require('../../domain/texto');
const Status = require('../../domain/StatusDenuncia');

class JsonDenunciaRepository extends DenunciaRepository {
  constructor(store) { super(); this.store = store; }
  async proximaSequencia(ano) {
    const s = this.store.dados.sequencias; s[ano] = (s[ano] || 0) + 1; this.store.persistir(); return s[ano];
  }
  async salvar(d) { this.store.dados.denuncias[d.id] = d.dados(); this.store.persistir(); }
  async buscarPorId(id) { const x = this.store.dados.denuncias[id]; return x ? new Denuncia(JSON.parse(JSON.stringify(x))) : null; }
  async listar(f = {}) {
    const b = f.busca ? normalizar(f.busca) : '';
    return Object.values(this.store.dados.denuncias)
      .filter((x) => (!f.cidadaoId || x.cidadaoId === f.cidadaoId) && (!f.status || x.status === f.status) && (!f.categoriaId || x.categoriaId === f.categoriaId)
        && (!f.abertas || !Status.ehFinal(x.status)) && (!b || normalizar(`${x.id} ${x.categoria} ${x.localizacao} ${x.descricao}`).includes(b)))
      .sort((a, c) => c.criadaEm.localeCompare(a.criadaEm))
      .map((x) => new Denuncia(JSON.parse(JSON.stringify(x))));
  }
}
module.exports = { JsonDenunciaRepository };
