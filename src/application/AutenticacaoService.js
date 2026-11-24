'use strict';
const crypto = require('crypto');
const { normalizarDocumento } = require('../domain/Documento');
const { NaoAutenticadoError } = require('../domain/errors');
const sha = (t) => crypto.createHash('sha256').update(String(t)).digest();
class AutenticacaoService {
  constructor({ tokens, servidor, validarDocumento = true }) { this.tokens = tokens; this.servidor = servidor; this.validarDocumento = validarDocumento; }
  entrarCidadao(documento) {
    const id = normalizarDocumento(documento, this.validarDocumento);
    return this.emitir({ id, papel: 'cidadao', nome: 'Cidadão', documento: `***${id.slice(-4)}` });
  }
  entrarServidor(matricula, senha) {
    const ok = String(matricula) === this.servidor.matricula && crypto.timingSafeEqual(sha(senha), sha(this.servidor.senha));
    if (!ok) throw new NaoAutenticadoError('Matrícula ou senha incorretas.');
    return this.emitir({ id: this.servidor.matricula, papel: 'servidor', nome: this.servidor.nome, setor: this.servidor.setor });
  }
  emitir(usuario) { return { token: this.tokens.emitir(usuario), usuario }; }
  usuarioDoToken(token) { return this.tokens.verificar(token); }
}
module.exports = { AutenticacaoService };
