'use strict';
/** Fluxo oficial: Recebida > Em análise > Encaminhada > Em execução > Concluída. */
const LISTA = Object.freeze([
  { id: 'RECEBIDA', rotulo: 'Recebida', titulo: 'Denúncia Recebida', descricao: () => 'Registrada pelo cidadão via Conecta Recife.' },
  { id: 'EM_ANALISE', rotulo: 'Em Análise', titulo: 'Em Análise', descricao: (sec) => `Equipe da Secretaria de ${sec} avaliou a solicitação.` },
  { id: 'ENCAMINHADA', rotulo: 'Encaminhada', titulo: 'Encaminhada', descricao: (sec) => `Encaminhada à equipe responsável da Secretaria de ${sec}.` },
  { id: 'EM_EXECUCAO', rotulo: 'Em Execução', titulo: 'Em Execução', descricao: () => 'Equipe técnica no local realizando o serviço.' },
  { id: 'CONCLUIDA', rotulo: 'Concluída', titulo: 'Concluída', descricao: (sec, feita) => (feita ? 'Serviço finalizado e confirmado.' : 'Aguardando confirmação de finalização do serviço.') }
]);
const indice = (id) => LISTA.findIndex((s) => s.id === id);
module.exports = {
  INICIAL: LISTA[0].id,
  FINAL: LISTA[LISTA.length - 1].id,
  todos: () => LISTA,
  existe: (id) => indice(id) >= 0,
  indice,
  rotulo: (id) => (LISTA[indice(id)] || {}).rotulo,
  proximo: (id) => (LISTA[indice(id) + 1] || {}).id || null,
  ehFinal: (id) => id === LISTA[LISTA.length - 1].id
};
