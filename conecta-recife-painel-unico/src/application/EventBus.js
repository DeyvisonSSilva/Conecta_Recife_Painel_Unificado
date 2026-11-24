'use strict';
/** Publicador/assinante simples: desacopla o caso de uso das notificações. */
class EventBus {
  constructor() { this.assinantes = new Map(); }
  assinar(evento, fn) { this.assinantes.set(evento, [...(this.assinantes.get(evento) || []), fn]); }
  async emitir(evento, payload) { for (const fn of this.assinantes.get(evento) || []) await fn(payload); }
}
module.exports = { EventBus };
