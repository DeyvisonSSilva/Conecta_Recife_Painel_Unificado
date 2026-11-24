'use strict';
const fs = require('fs');
const path = require('path');
/** Arquivo JSON com escrita atômica (temp + rename). Zero configuração. */
class JsonStore {
  constructor(arquivo) {
    this.arquivo = arquivo;
    let conteudo;
    try {
      conteudo = fs.readFileSync(arquivo, 'utf8');
    } catch (erro) {
      if (erro.code !== 'ENOENT') throw erro;
    }

    this.dados = conteudo === undefined ? {} : JSON.parse(conteudo);
    if (!this.dados || typeof this.dados !== 'object' || Array.isArray(this.dados)) {
      throw new TypeError(`Conteúdo inválido no banco JSON: ${arquivo}`);
    }

    if (this.dados.denuncias === undefined) this.dados.denuncias = {};
    if (this.dados.notificacoes === undefined) this.dados.notificacoes = [];
    if (this.dados.sequencias === undefined) this.dados.sequencias = {};

    if (!this.dados.denuncias || typeof this.dados.denuncias !== 'object' || Array.isArray(this.dados.denuncias)) {
      throw new TypeError(`Campo "denuncias" inválido no banco JSON: ${arquivo}`);
    }
    if (!Array.isArray(this.dados.notificacoes)) {
      throw new TypeError(`Campo "notificacoes" inválido no banco JSON: ${arquivo}`);
    }
    if (!this.dados.sequencias || typeof this.dados.sequencias !== 'object' || Array.isArray(this.dados.sequencias)) {
      throw new TypeError(`Campo "sequencias" inválido no banco JSON: ${arquivo}`);
    }
  }
  persistir() {
    fs.mkdirSync(path.dirname(this.arquivo), { recursive: true });
    const tmp = `${this.arquivo}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.dados, null, 2));
    fs.renameSync(tmp, this.arquivo);
  }
}
module.exports = { JsonStore };
