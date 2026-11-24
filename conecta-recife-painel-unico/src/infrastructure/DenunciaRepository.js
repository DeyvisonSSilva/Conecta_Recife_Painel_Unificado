'use strict';
/** Contrato (porta) que qualquer banco precisa cumprir. Substituível sem mexer nos casos de uso (LSP/DIP). */
class DenunciaRepository {
  async proximaSequencia(/* ano */) { throw new Error('não implementado'); }
  async salvar(/* denuncia */) { throw new Error('não implementado'); }
  async buscarPorId(/* id */) { throw new Error('não implementado'); }
  /** filtro: { cidadaoId, status, categoriaId, abertas, busca } – ordenado da mais recente para a mais antiga */
  async listar(/* filtro */) { throw new Error('não implementado'); }
}
class NotificacaoRepository {
  async salvar(/* notificacao */) { throw new Error('não implementado'); }
  async listarPorUsuario(/* usuarioId */) { throw new Error('não implementado'); }
  async marcarComoLidas(/* usuarioId */) { throw new Error('não implementado'); }
}
module.exports = { DenunciaRepository, NotificacaoRepository };
