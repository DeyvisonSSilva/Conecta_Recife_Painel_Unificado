'use strict';
const { NaoAutenticadoError, AcessoNegadoError } = require('../../domain/errors');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const autenticar = (auth) => (req, _res, next) => {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const usuario = m && auth.usuarioDoToken(m[1]);
  if (!usuario) return next(new NaoAutenticadoError('Sessão expirada. Entre novamente.'));
  req.usuario = usuario; next();
};
const exigirPapel = (papel) => (req, _res, next) => (req.usuario.papel === papel ? next() : next(new AcessoNegadoError('Você não tem permissão para esta ação.')));
// eslint-disable-next-line no-unused-vars
const tratarErros = (err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'Arquivo muito grande.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (err.statusHttp) return res.status(err.statusHttp).json({ erro: err.message });
  console.error(err); res.status(500).json({ erro: 'Erro interno do servidor.' });
};
module.exports = { asyncHandler, autenticar, exigirPapel, tratarErros };
