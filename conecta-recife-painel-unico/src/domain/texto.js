'use strict';
/** Minúsculas, sem acentos e sem espaços repetidos – usado em buscas e classificação. */
const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
module.exports = { normalizar };
