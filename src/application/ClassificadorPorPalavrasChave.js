'use strict';
const { normalizar } = require('../domain/texto');
/** Estratégia de classificação automática (pode ser trocada por outra sem alterar o serviço). */
class ClassificadorPorPalavrasChave {
  constructor(catalogo) { this.catalogo = catalogo; }
  classificar(texto) {
    const t = normalizar(texto);
    let melhor = null; let max = 0;
    for (const c of this.catalogo.todas()) {
      const acertos = c.palavrasChave.filter((k) => t.includes(normalizar(k))).length;
      if (acertos > max) { max = acertos; melhor = c; }
    }
    return melhor;
  }
}
module.exports = { ClassificadorPorPalavrasChave };
