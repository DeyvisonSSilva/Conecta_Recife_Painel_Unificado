'use strict';

const express = require('express');
const { carregarConfig } = require('./src/config');
const { montarAplicacao } = require('./src/composicao');

function criarAplicacao(config = carregarConfig()) {
  const app = express();
  let sistemaPromise;
  const inicializar = () => {
    if (!sistemaPromise) sistemaPromise = montarAplicacao(config);
    return sistemaPromise;
  };

  app.use((req, res, next) => {
    inicializar()
      .then((sistema) => sistema.app(req, res))
      .catch(next);
  });
  app.use((erro, _req, res, _next) => {
    console.error('Falha ao inicializar aplicação:', erro);
    res.status(500).json({ erro: 'Falha ao inicializar a aplicação. Verifique as configurações do serviço.' });
  });

  app.inicializar = inicializar;
  app.encerrar = async () => {
    if (sistemaPromise) {
      const sistema = await sistemaPromise;
      await sistema.encerrar();
    }
  };
  return app;
}

async function iniciarServidor(config = carregarConfig()) {
  const app = criarAplicacao(config);
  const sistema = await app.inicializar();
  let servidor;

  try {
    servidor = app.listen(config.porta);
    await new Promise((resolve, reject) => {
      const aoEscutar = () => {
        servidor.removeListener('error', aoFalhar);
        resolve();
      };
      const aoFalhar = (erro) => {
        servidor.removeListener('listening', aoEscutar);
        reject(erro);
      };
      servidor.once('listening', aoEscutar);
      servidor.once('error', aoFalhar);
    });
  } catch (erro) {
    await app.encerrar();
    throw erro;
  }

  let encerramento;
  const encerrar = () => {
    if (!encerramento) {
      encerramento = new Promise((resolve, reject) => {
        servidor.close((erro) => erro ? reject(erro) : resolve());
      }).then(() => app.encerrar());
    }
    return encerramento;
  };

  return { servidor, armazenamento: sistema.armazenamento, encerrar };
}

const aplicacao = criarAplicacao();
aplicacao.iniciarServidor = iniciarServidor;
aplicacao.criarAplicacao = criarAplicacao;

if (require.main === module) {
  iniciarServidor().then((sistema) => {
    const porta = sistema.servidor.address().port;
    console.log(`Conecta Recife – Painel Único de Denúncias em http://localhost:${porta}`);
    console.log(`Armazenamento: ${sistema.armazenamento}`);

    let encerrando = false;
    const encerrar = () => {
      if (encerrando) return;
      encerrando = true;
      sistema.encerrar().catch((erro) => {
        console.error('Falha ao encerrar:', erro.message);
        process.exitCode = 1;
      });
    };
    process.once('SIGINT', encerrar);
    process.once('SIGTERM', encerrar);
  }).catch((erro) => {
    console.error('Falha ao iniciar:', erro.message);
    process.exitCode = 1;
  });
}

module.exports = aplicacao;
