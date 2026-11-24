'use strict';
/** Composition root: único lugar que conhece as implementações concretas. */
const path = require('path');
const { CatalogoCategorias } = require('./domain/CatalogoCategorias');
const { ClassificadorPorPalavrasChave } = require('./application/ClassificadorPorPalavrasChave');
const { EventBus } = require('./application/EventBus');
const { GeradorProtocolo } = require('./application/GeradorProtocolo');
const { ArmazenamentoFotosLocal } = require('./application/ArmazenamentoFotosLocal');
const { DenunciaService } = require('./application/DenunciaService');
const { NotificacaoService, CanalNoAplicativo, CanalEmailSimulado } = require('./application/NotificacaoService');
const { PainelService } = require('./application/PainelService');
const { GeradorCsv } = require('./application/GeradorCsv');
const { AutenticacaoService } = require('./application/AutenticacaoService');
const { TokenService } = require('./infrastructure/auth/TokenService');
const { criarApp } = require('./interfaces/http/criarApp');

async function criarPersistencia(config) {
  if (process.env.VERCEL && !config.databaseUrl) {
    throw new Error('Configure DATABASE_URL com um PostgreSQL externo para executar no Vercel.');
  }
  if (config.databaseUrl) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: config.databaseUrl });
    await require('./infrastructure/postgres/aplicarSchema').aplicarSchema(pool);
    const { PostgresDenunciaRepository } = require('./infrastructure/postgres/PostgresDenunciaRepository');
    const { PostgresNotificacaoRepository } = require('./infrastructure/postgres/PostgresNotificacaoRepository');
    return { armazenamento: 'PostgreSQL', denuncias: new PostgresDenunciaRepository(pool), notificacoes: new PostgresNotificacaoRepository(pool), encerrar: () => pool.end() };
  }
  const { JsonStore } = require('./infrastructure/json/JsonStore');
  const { JsonDenunciaRepository } = require('./infrastructure/json/JsonDenunciaRepository');
  const { JsonNotificacaoRepository } = require('./infrastructure/json/JsonNotificacaoRepository');
  const store = new JsonStore(path.join(config.dadosDir, 'banco.json'));
  return { armazenamento: 'Arquivo JSON local', denuncias: new JsonDenunciaRepository(store), notificacoes: new JsonNotificacaoRepository(store), encerrar: async () => {} };
}

async function montarAplicacao(config, persistencia, relogio = { agora: () => new Date() }) {
  const p = persistencia || await criarPersistencia(config);
  const catalogo = new CatalogoCategorias();
  const eventos = new EventBus();
  const diretorioUploads = path.join(config.dadosDir, 'uploads');
  const denuncias = new DenunciaService({
    repositorio: p.denuncias, catalogo, classificador: new ClassificadorPorPalavrasChave(catalogo), geradorProtocolo: new GeradorProtocolo(p.denuncias, relogio),
    armazenamentoFotos: new ArmazenamentoFotosLocal(diretorioUploads), eventos, relogio
  });
  const notificacoes = new NotificacaoService({ repositorio: p.notificacoes, canais: [new CanalNoAplicativo(p.notificacoes), new CanalEmailSimulado()], relogio });
  notificacoes.registrarEm(eventos);
  const auth = new AutenticacaoService({ tokens: new TokenService(config.segredo, undefined, relogio), servidor: config.servidor, validarDocumento: config.validarDocumento });
  const app = criarApp({ auth, catalogo, denuncias, notificacoes, painel: new PainelService({ repositorio: p.denuncias, catalogo, relogio }), gerarCsv: new GeradorCsv(), armazenamento: p.armazenamento, diretorioUploads });
  return { app, encerrar: p.encerrar, armazenamento: p.armazenamento };
}
module.exports = { montarAplicacao };
