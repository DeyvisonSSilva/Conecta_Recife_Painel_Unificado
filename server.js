'use strict';

const { carregarConfig } = require('./src/config');
const { montarAplicacao } = require('./src/composicao');

async function iniciarServidor(config = carregarConfig()) {
  const sistema = await montarAplicacao(config);
  let servidor;

  try {
    servidor = sistema.app.listen(config.porta);
    await new Promise((resolve, reject) => {
      servidor.once('listening', resolve);
      servidor.once('error', reject);
    });
  } catch (erro) {
    await sistema.encerrar();
    throw erro;
  }

  let encerramento;
  const encerrar = () => {
    if (!encerramento) {
      encerramento = new Promise((resolve, reject) => {
        servidor.close((erro) => erro ? reject(erro) : resolve());
      }).then(() => sistema.encerrar());
    }
    return encerramento;
  };

  return { servidor, armazenamento: sistema.armazenamento, encerrar };
}

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

module.exports = { iniciarServidor };
