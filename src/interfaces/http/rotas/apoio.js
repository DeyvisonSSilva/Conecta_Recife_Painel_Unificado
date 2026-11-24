'use strict';
const { Router } = require('express');
const { asyncHandler, autenticar, exigirPapel } = require('../middlewares');
/** Categorias, classificação automática, notificações e painel do servidor. */
module.exports = ({ auth, catalogo, denuncias, notificacoes, painel, gerarCsv, armazenamento }) => {
  const r = Router();
  r.get('/categorias', (_req, res) => res.json(catalogo.todas().map(({ id, nome, secretaria }) => ({ id, nome, secretaria }))));
  r.post('/classificacao', autenticar(auth), (req, res) => {
    const c = denuncias.sugerirCategoria(req.body.descricao);
    res.json({ categoria: c ? { id: c.id, nome: c.nome, secretaria: c.secretaria } : null });
  });
  r.get('/notificacoes', autenticar(auth), exigirPapel('cidadao'), asyncHandler(async (req, res) => res.json(await notificacoes.listar(req.usuario.id))));
  r.post('/notificacoes/lidas', autenticar(auth), exigirPapel('cidadao'), asyncHandler(async (req, res) => { await notificacoes.marcarComoLidas(req.usuario.id); res.status(204).end(); }));
  r.get('/painel/estatisticas', autenticar(auth), exigirPapel('servidor'), asyncHandler(async (_req, res) => res.json(await painel.estatisticas())));
  r.get('/painel/relatorio.csv', autenticar(auth), exigirPapel('servidor'), asyncHandler(async (_req, res) => {
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="relatorio-denuncias.csv"' }).send(await painel.relatorioCsv(gerarCsv));
  }));
  r.get('/sistema', autenticar(auth), exigirPapel('servidor'), (_req, res) => res.json({ armazenamento }));
  return r;
};
