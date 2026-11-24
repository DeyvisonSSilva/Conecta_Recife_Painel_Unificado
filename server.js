'use strict';
const { carregarConfig } = require('./src/config');
const { montarAplicacao } = require('./src/composicao');
const config = carregarConfig();
montarAplicacao(config).then(({ app, armazenamento }) => {
  app.listen(config.porta, () => {
    console.log(`Conecta Recife – Painel Único de Denúncias em http://localhost:${config.porta}`);
    console.log(`Armazenamento: ${armazenamento}`);
  });
}).catch((e) => { console.error('Falha ao iniciar:', e.message); process.exit(1); });
