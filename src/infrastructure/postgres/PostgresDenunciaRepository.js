'use strict';
const { DenunciaRepository } = require('../DenunciaRepository');
const { Denuncia } = require('../../domain/Denuncia');
const Status = require('../../domain/StatusDenuncia');
const iso = (v) => (v instanceof Date ? v.toISOString() : v);
const paraDenuncia = (r) => new Denuncia({
  id: r.id, categoriaId: r.categoria_id, categoria: r.categoria, secretaria: r.secretaria, prazoDias: r.prazo_dias, localizacao: r.localizacao,
  coordenadas: r.coordenadas, descricao: r.descricao, fotos: r.fotos, cidadaoId: r.cidadao_id, vinculadaA: r.vinculada_a, status: r.status,
  historico: r.historico, criadaEm: iso(r.criada_em), atualizadaEm: iso(r.atualizada_em)
});
class PostgresDenunciaRepository extends DenunciaRepository {
  constructor(pool) { super(); this.pool = pool; }
  async proximaSequencia(ano) {
    const r = await this.pool.query('INSERT INTO protocolo_seq(ano, ultimo) VALUES($1, 1) ON CONFLICT (ano) DO UPDATE SET ultimo = protocolo_seq.ultimo + 1 RETURNING ultimo', [ano]);
    return Number(r.rows[0].ultimo);
  }
  async salvar(d) {
    const x = d.dados();
    await this.pool.query(
      `INSERT INTO denuncias(id,categoria_id,categoria,secretaria,prazo_dias,localizacao,coordenadas,descricao,fotos,cidadao_id,vinculada_a,status,historico,criada_em,atualizada_em)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, historico=EXCLUDED.historico, fotos=EXCLUDED.fotos, atualizada_em=EXCLUDED.atualizada_em`,
      [x.id, x.categoriaId, x.categoria, x.secretaria, x.prazoDias, x.localizacao, JSON.stringify(x.coordenadas), x.descricao, JSON.stringify(x.fotos), x.cidadaoId, x.vinculadaA, x.status, JSON.stringify(x.historico), x.criadaEm, x.atualizadaEm]);
  }
  async buscarPorId(id) { const r = await this.pool.query('SELECT * FROM denuncias WHERE id = $1', [id]); return r.rows[0] ? paraDenuncia(r.rows[0]) : null; }
  async listar(f = {}) {
    const w = []; const p = [];
    const add = (sql, v) => { p.push(v); w.push(sql.replace('?', `$${p.length}`)); };
    if (f.cidadaoId) add('cidadao_id = ?', f.cidadaoId);
    if (f.status) add('status = ?', f.status);
    if (f.categoriaId) add('categoria_id = ?', f.categoriaId);
    if (f.abertas) add('status <> ?', Status.FINAL);
    if (f.busca) { p.push(`%${f.busca}%`); const n = p.length; w.push(`(id ILIKE $${n} OR categoria ILIKE $${n} OR localizacao ILIKE $${n} OR descricao ILIKE $${n})`); }
    const r = await this.pool.query(`SELECT * FROM denuncias ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY criada_em DESC`, p);
    return r.rows.map(paraDenuncia);
  }
}
module.exports = { PostgresDenunciaRepository };
