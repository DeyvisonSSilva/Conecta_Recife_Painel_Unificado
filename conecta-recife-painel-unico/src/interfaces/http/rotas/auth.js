'use strict';
const { Router } = require('express');
const { asyncHandler, autenticar } = require('../middlewares');
module.exports = ({ auth }) => {
  const r = Router();
  r.post('/cidadao', asyncHandler(async (req, res) => res.json(auth.entrarCidadao(req.body.documento))));
  r.post('/servidor', asyncHandler(async (req, res) => res.json(auth.entrarServidor(req.body.matricula, req.body.senha))));
  r.get('/eu', autenticar(auth), (req, res) => res.json({ usuario: req.usuario }));
  return r;
};
