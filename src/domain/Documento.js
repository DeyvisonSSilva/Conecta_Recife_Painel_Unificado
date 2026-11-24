'use strict';
const { ValidacaoError } = require('./errors');
const repetido = (d) => /^(\d)\1+$/.test(d);
function cpfValido(d) {
  if (d.length !== 11 || repetido(d)) return false;
  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(d[t])) return false;
  }
  return true;
}
function cnpjValido(d) {
  if (d.length !== 14 || repetido(d)) return false;
  for (const n of [12, 13]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (((n - i - 1) % 8) + 2);
    const resto = soma % 11;
    if ((resto < 2 ? 0 : 11 - resto) !== Number(d[n])) return false;
  }
  return true;
}
/** Retorna somente os dígitos de um CPF/CNPJ válido ou lança ValidacaoError. */
function normalizarDocumento(texto, validarDigitos = true) {
  const d = String(texto ?? '').replace(/\D/g, '');
  if (d.length !== 11 && d.length !== 14) throw new ValidacaoError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).');
  if (validarDigitos && !(d.length === 11 ? cpfValido(d) : cnpjValido(d))) throw new ValidacaoError('CPF ou CNPJ inválido.');
  return d;
}
module.exports = { normalizarDocumento, cpfValido, cnpjValido };
