'use strict';
const crypto = require('crypto');
const Status = require('../domain/StatusDenuncia');

/** Observa eventos de domínio e dispara a notificação por todos os canais configurados. */
class NotificacaoService {
  constructor({ repositorio, canais, relogio }) { this.repositorio = repositorio; this.canais = canais; this.relogio = relogio; }
  registrarEm(eventos) {
    eventos.assinar('denuncia.registrada', ({ denuncia }) => this.notificar(denuncia, `Denúncia #${denuncia.id} registrada e encaminhada para a Secretaria de ${denuncia.secretaria}.`));
    eventos.assinar('denuncia.status_alterado', ({ denuncia }) => this.notificar(denuncia, `Sua denúncia #${denuncia.id} mudou para "${Status.rotulo(denuncia.status)}".`));
  }
  async notificar(denuncia, mensagem) {
    const n = { id: crypto.randomUUID(), usuarioId: denuncia.cidadaoId, denunciaId: denuncia.id, mensagem, criadaEm: this.relogio.agora().toISOString(), lida: false };
    for (const canal of this.canais) await canal.enviar(n);
  }
  listar(usuarioId) { return this.repositorio.listarPorUsuario(usuarioId); }
  marcarComoLidas(usuarioId) { return this.repositorio.marcarComoLidas(usuarioId); }
}
/** Canal "no aplicativo": persiste a notificação para o cidadão consultar. */
class CanalNoAplicativo { constructor(repositorio) { this.repositorio = repositorio; } enviar(n) { return this.repositorio.salvar(n); } }
/** Canal e-mail simulado (AV2: trocar por SMTP/push real sem alterar o serviço). */
class CanalEmailSimulado { constructor(log = console.log) { this.log = log; } enviar(n) { this.log(`[e-mail simulado] ${n.usuarioId}: ${n.mensagem}`); } }
module.exports = { NotificacaoService, CanalNoAplicativo, CanalEmailSimulado };
