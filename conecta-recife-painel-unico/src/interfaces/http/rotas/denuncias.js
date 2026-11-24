'use strict';
const { Router } = require('express');
const { asyncHandler, autenticar, exigirPapel } = require('../middlewares');
module.exports = ({ auth, denuncias }) => {
  const r = Router();
  r.use(autenticar(auth));
  r.get('/duplicidade', exigirPapel('cidadao'), asyncHandler(async (req, res) => {
    const d = await denuncias.verificarDuplicidade(req.query.categoriaId, req.query.localizacao);
    res.json({ duplicada: d ? { id: d.id, rotuloStatus: d.toJSON().rotuloStatus } : null });
  }));
  r.post('/', exigirPapel('cidadao'), asyncHandler(async (req, res) => res.status(201).json(await denuncias.registrar(req.usuario, req.body))));
  r.get('/', asyncHandler(async (req, res) => {
    const { status, categoriaId, busca } = req.query;
    res.json(await denuncias.listar(req.usuario, { status, categoriaId, busca }));
  }));
  r.get('/:id', asyncHandler(async (req, res) => res.json(await denuncias.obter(req.usuario, req.params.id))));
  r.patch('/:id/status', asyncHandler(async (req, res) => res.json(await denuncias.avancarStatus(req.usuario, req.params.id, req.body))));
  return r;
};
