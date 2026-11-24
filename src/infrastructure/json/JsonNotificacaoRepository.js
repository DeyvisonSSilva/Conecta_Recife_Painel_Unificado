'use strict';
const { NotificacaoRepository } = require('../DenunciaRepository');
class JsonNotificacaoRepository extends NotificacaoRepository {
  constructor(store) { super(); this.store = store; }
  async salvar(n) { this.store.dados.notificacoes.push(n); this.store.persistir(); }
  async listarPorUsuario(id) { return this.store.dados.notificacoes.filter((n) => n.usuarioId === id).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)); }
  async marcarComoLidas(id) { this.store.dados.notificacoes.forEach((n) => { if (n.usuarioId === id) n.lida = true; }); this.store.persistir(); }
}
module.exports = { JsonNotificacaoRepository };
