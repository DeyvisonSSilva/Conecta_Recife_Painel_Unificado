'use strict';
const Status = require('../domain/StatusDenuncia');
const celula = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
class GeradorCsv {
  gerar(denuncias) {
    const cab = ['protocolo', 'categoria', 'secretaria', 'localizacao', 'status', 'registrada_em', 'atualizada_em', 'concluida_em'];
    const linhas = denuncias.map((d) => [d.id, d.categoria, d.secretaria, d.localizacao, Status.rotulo(d.status), d.criadaEm, d.atualizadaEm, d.dataConclusao() || ''].map(celula).join(';'));
    return '\uFEFF' + [cab.join(';'), ...linhas].join('\r\n');
  }
}
module.exports = { GeradorCsv };
