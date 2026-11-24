'use strict';
const crypto = require('crypto');
/** Token assinado (HMAC-SHA256) com expiração – não exige armazenar sessões. */
class TokenService {
  constructor(segredo, ttlSegundos = 8 * 3600, relogio = { agora: () => new Date() }) { this.segredo = segredo; this.ttl = ttlSegundos; this.relogio = relogio; }
  assinar(corpo) { return crypto.createHmac('sha256', this.segredo).update(corpo).digest('base64url'); }
  emitir(usuario) {
    const corpo = Buffer.from(JSON.stringify({ u: usuario, exp: Math.floor(this.relogio.agora().getTime() / 1000) + this.ttl })).toString('base64url');
    return `${corpo}.${this.assinar(corpo)}`;
  }
  verificar(token) {
    const [corpo, assinatura] = String(token || '').split('.');
    if (!corpo || !assinatura) return null;
    const esperado = Buffer.from(this.assinar(corpo)); const recebido = Buffer.from(assinatura);
    if (esperado.length !== recebido.length || !crypto.timingSafeEqual(esperado, recebido)) return null;
    try { const p = JSON.parse(Buffer.from(corpo, 'base64url').toString()); return p.exp > this.relogio.agora().getTime() / 1000 ? p.u : null; } catch { return null; }
  }
}
module.exports = { TokenService };
