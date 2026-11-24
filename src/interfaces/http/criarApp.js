'use strict';
const express = require('express');
const path = require('path');
const { tratarErros } = require('./middlewares');
const rotasAuth = require('./rotas/auth');
const rotasDenuncias = require('./rotas/denuncias');
const rotasApoio = require('./rotas/apoio');
function criarApp(deps) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); next(); });
  app.use(express.json({ limit: '12mb' }));
  app.use('/api/auth', rotasAuth(deps));
  app.use('/api/denuncias', rotasDenuncias(deps));
  app.use('/api', rotasApoio(deps));
  app.use('/uploads', express.static(deps.diretorioUploads));
  app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));
  app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use(tratarErros);
  return app;
}
module.exports = { criarApp };
