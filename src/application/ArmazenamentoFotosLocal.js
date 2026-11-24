'use strict';
const fs = require('fs');
const path = require('path');
const { ValidacaoError } = require('../domain/errors');
const MAX_FOTOS = 3;
const MAX_BYTES = 2 * 1024 * 1024;
/** Grava as fotos enviadas (data URL) em disco e devolve as URLs públicas. */
class ArmazenamentoFotosLocal {
  constructor(diretorio, urlBase = '/uploads') { this.diretorio = diretorio; this.urlBase = urlBase; }
  async salvar(protocolo, fotos = []) {
    if (!Array.isArray(fotos)) throw new ValidacaoError('Fotos inválidas.');
    if (fotos.length > MAX_FOTOS) throw new ValidacaoError(`Envie no máximo ${MAX_FOTOS} fotos.`);
    const arquivos = fotos.map((url, i) => {
      const m = /^data:image\/(png|jpeg|webp);base64,/.exec(String(url));
      if (!m) throw new ValidacaoError('Formato de foto inválido (use PNG, JPG ou WEBP).');
      const buf = Buffer.from(String(url).slice(m[0].length), 'base64');
      if (buf.length > MAX_BYTES) throw new ValidacaoError('Cada foto pode ter no máximo 2 MB.');
      return { nome: `${protocolo}-${i + 1}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`, buf };
    });
    if (arquivos.length) fs.mkdirSync(this.diretorio, { recursive: true });
    return arquivos.map(({ nome, buf }) => { fs.writeFileSync(path.join(this.diretorio, nome), buf); return `${this.urlBase}/${nome}`; });
  }
}
module.exports = { ArmazenamentoFotosLocal };
