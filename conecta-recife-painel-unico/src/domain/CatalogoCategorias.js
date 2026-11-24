'use strict';
/** Para criar uma nova categoria basta acrescentar uma entrada aqui (Aberto/Fechado). */
const CATEGORIAS_PADRAO = Object.freeze([
  { id: 'BURACO_VIA', nome: 'Buraco na Via', secretaria: 'Infraestrutura', prazoDias: 15, palavrasChave: ['buraco', 'asfalto', 'cratera', 'pavimento', 'esburacada'] },
  { id: 'ILUMINACAO', nome: 'Iluminação Pública', secretaria: 'Iluminação Pública', prazoDias: 7, palavrasChave: ['poste', 'luz', 'lampada', 'iluminacao', 'escuro', 'apagado'] },
  { id: 'ENTULHO', nome: 'Descarte Irregular de Entulho', secretaria: 'Meio Ambiente', prazoDias: 10, palavrasChave: ['entulho', 'lixo', 'descarte', 'cacamba', 'residuo'] },
  { id: 'PODA', nome: 'Poda de Árvore', secretaria: 'Meio Ambiente', prazoDias: 20, palavrasChave: ['arvore', 'poda', 'galho', 'tronco', 'folhagem'] }
]);
class CatalogoCategorias {
  constructor(categorias = CATEGORIAS_PADRAO) { this.categorias = categorias; }
  todas() { return this.categorias; }
  buscar(id) { return this.categorias.find((c) => c.id === id) || null; }
}
module.exports = { CatalogoCategorias, CATEGORIAS_PADRAO };
