'use strict';
class GeradorProtocolo {
  constructor(repositorio, relogio) { this.repositorio = repositorio; this.relogio = relogio; }
  async proximo() {
    const ano = this.relogio.agora().getFullYear();
    const seq = await this.repositorio.proximaSequencia(ano);
    return `REC-${ano}-${String(seq).padStart(5, '0')}`;
  }
}
module.exports = { GeradorProtocolo };
