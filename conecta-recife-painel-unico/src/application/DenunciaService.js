'use strict';
const { Denuncia } = require('../domain/Denuncia');
const { normalizar } = require('../domain/texto');
const { ValidacaoError, NaoEncontradoError, AcessoNegadoError } = require('../domain/errors');

/** Casos de uso de denúncias. Depende apenas de abstrações injetadas (DIP). */
class DenunciaService {
  constructor({ repositorio, catalogo, classificador, geradorProtocolo, armazenamentoFotos, eventos, relogio }) {
    Object.assign(this, { repositorio, catalogo, classificador, geradorProtocolo, armazenamentoFotos, eventos, relogio });
  }

  sugerirCategoria(descricao) { return this.classificador.classificar(descricao); }

  async verificarDuplicidade(categoriaId, localizacao) {
    const alvo = normalizar(localizacao);
    if (alvo.length < 5) return null;
    const abertas = await this.repositorio.listar({ categoriaId, abertas: true });
    return abertas.find((d) => { const l = normalizar(d.localizacao); return l === alvo || (l.length >= 5 && (l.includes(alvo) || alvo.includes(l))); }) || null;
  }

  async registrar(usuario, { categoriaId, localizacao, coordenadas, descricao, fotos }) {
    const categoria = categoriaId ? this.catalogo.buscar(categoriaId) : this.classificador.classificar(descricao);
    if (!categoria) throw new ValidacaoError(categoriaId ? 'Categoria inválida.' : 'Selecione a categoria da denúncia.');
    const similar = await this.verificarDuplicidade(categoria.id, localizacao);
    const protocolo = await this.geradorProtocolo.proximo();
    const denuncia = Denuncia.registrar({ protocolo, categoria, localizacao, coordenadas, descricao, cidadaoId: usuario.id, vinculadaA: similar ? similar.id : null, agora: this.relogio.agora() });
    denuncia.fotos = await this.armazenamentoFotos.salvar(protocolo, fotos);
    await this.repositorio.salvar(denuncia);
    await this.eventos.emitir('denuncia.registrada', { denuncia });
    return denuncia;
  }

  async listar(usuario, filtro = {}) {
    const f = { ...filtro };
    if (usuario.papel === 'cidadao') f.cidadaoId = usuario.id;
    return this.repositorio.listar(f);
  }

  async obter(usuario, id) {
    const d = await this.repositorio.buscarPorId(id);
    if (!d || (usuario.papel === 'cidadao' && d.cidadaoId !== usuario.id)) throw new NaoEncontradoError('Denúncia não encontrada.');
    return d;
  }

  async avancarStatus(usuario, id, { status, observacao }) {
    if (usuario.papel !== 'servidor') throw new AcessoNegadoError('Apenas servidores podem atualizar o andamento.');
    const d = await this.obter(usuario, id);
    d.avancar(status, { observacao, autor: usuario.id, agora: this.relogio.agora() });
    await this.repositorio.salvar(d);
    await this.eventos.emitir('denuncia.status_alterado', { denuncia: d });
    return d;
  }
}
module.exports = { DenunciaService };
