'use strict';
class ErroDeDominio extends Error {
  constructor(mensagem, statusHttp) { super(mensagem); this.name = this.constructor.name; this.statusHttp = statusHttp; }
}
class ValidacaoError extends ErroDeDominio { constructor(m) { super(m, 422); } }
class NaoAutenticadoError extends ErroDeDominio { constructor(m = 'Autenticação necessária.') { super(m, 401); } }
class AcessoNegadoError extends ErroDeDominio { constructor(m = 'Acesso negado.') { super(m, 403); } }
class NaoEncontradoError extends ErroDeDominio { constructor(m = 'Registro não encontrado.') { super(m, 404); } }
class TransicaoInvalidaError extends ErroDeDominio { constructor(m) { super(m, 409); } }
module.exports = { ErroDeDominio, ValidacaoError, NaoAutenticadoError, AcessoNegadoError, NaoEncontradoError, TransicaoInvalidaError };
