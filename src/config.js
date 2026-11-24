'use strict';
const path = require('path');
function carregarConfig(env = process.env) {
  return {
    porta: Number(env.PORT) || 3000,
    dadosDir: env.DATA_DIR || path.join(__dirname, '..', 'data'),
    databaseUrl: env.DATABASE_URL || null,
    segredo: env.AUTH_SECRET || 'troque-este-segredo-em-producao',
    validarDocumento: env.VALIDAR_DOCUMENTO !== 'false',
    servidor: {
      matricula: env.SERVIDOR_MATRICULA || 'carlos.lima',
      senha: env.SERVIDOR_SENHA || 'recife123',
      nome: env.SERVIDOR_NOME || 'Carlos Lima',
      setor: env.SERVIDOR_SETOR || 'Secretaria de Infraestrutura'
    }
  };
}
module.exports = { carregarConfig };
