'use strict';
const fs = require('fs');
const path = require('path');
/** Arquivo JSON com escrita atômica (temp + rename). Zero configuração. */
class JsonStore {
  constructor(arquivo) {
    this.arquivo = arquivo;
    try { this.dados = JSON.parse(fs.readFileSync(arquivo, 'utf8')); } catch { this.dados = {}; }
    this.dados.denuncias = this.dados.denuncias || {};
    this.dados.notificacoes = this.dados.notificacoes || [];
    this.dados.sequencias = this.dados.sequencias || {};
  }
  persistir() {
    fs.mkdirSync(path.dirname(this.arquivo), { recursive: true });
    const tmp = `${this.arquivo}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.dados, null, 2));
    fs.renameSync(tmp, this.arquivo);
  }
}
module.exports = { JsonStore };
