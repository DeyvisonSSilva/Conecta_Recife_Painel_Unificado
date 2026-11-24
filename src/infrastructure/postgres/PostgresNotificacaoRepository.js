'use strict';
const { NotificacaoRepository } = require('../DenunciaRepository');
const paraNotificacao = (r) => ({ id: r.id, usuarioId: r.usuario_id, denunciaId: r.denuncia_id, mensagem: r.mensagem, criadaEm: r.criada_em instanceof Date ? r.criada_em.toISOString() : r.criada_em, lida: r.lida });
class PostgresNotificacaoRepository extends NotificacaoRepository {
  constructor(pool) { super(); this.pool = pool; }
  async salvar(n) { await this.pool.query('INSERT INTO notificacoes(id,usuario_id,denuncia_id,mensagem,criada_em,lida) VALUES($1,$2,$3,$4,$5,$6)', [n.id, n.usuarioId, n.denunciaId, n.mensagem, n.criadaEm, n.lida]); }
  async listarPorUsuario(id) { const r = await this.pool.query('SELECT * FROM notificacoes WHERE usuario_id = $1 ORDER BY criada_em DESC', [id]); return r.rows.map(paraNotificacao); }
  async marcarComoLidas(id) { await this.pool.query('UPDATE notificacoes SET lida = TRUE WHERE usuario_id = $1', [id]); }
}
module.exports = { PostgresNotificacaoRepository };
