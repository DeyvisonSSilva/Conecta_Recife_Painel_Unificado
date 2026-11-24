'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { iniciarServidor, criarAplicacao } = require('../server');
const { carregarConfig } = require('../src/config');
const { montarAplicacao } = require('../src/composicao');
const { normalizarDocumento } = require('../src/domain/Documento');
const { JsonStore } = require('../src/infrastructure/json/JsonStore');

const CPF = '529.982.247-25';
const CPF2 = '111.444.777-35';
let dir, servidor, base, sistema;

async function subir(config) {
  const s = await montarAplicacao(config);
  const srv = await new Promise((ok) => { const x = s.app.listen(0, () => ok(x)); });
  return { s, srv, base: `http://127.0.0.1:${srv.address().port}` };
}
async function http(metodo, url, { token, corpo } = {}) {
  const r = await fetch(base + url, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  const tipo = r.headers.get('content-type') || '';
  return { status: r.status, corpo: tipo.includes('json') ? await r.json() : await r.text(), tipo };
}
const login = async (cpf) => (await http('POST', '/api/auth/cidadao', { corpo: { documento: cpf } })).corpo.token;
const loginServidor = async () => (await http('POST', '/api/auth/servidor', { corpo: { matricula: 'carlos.lima', senha: 'recife123' } })).corpo.token;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pud-'));
  const config = carregarConfig({ DATA_DIR: dir });
  const x = await subir(config); servidor = x.srv; base = x.base; sistema = x.s;
});
after(() => servidor.close());

test('valida CPF e CNPJ', () => {
  assert.equal(normalizarDocumento(CPF), '52998224725');
  assert.throws(() => normalizarDocumento('123.456.789-00'), /inválido/);
  assert.equal(normalizarDocumento('11.222.333/0001-81'), '11222333000181');
});

test('sistema inicia sem nenhuma denúncia', async () => {
  const t = await login(CPF);
  assert.deepEqual((await http('GET', '/api/denuncias', { token: t })).corpo, []);
  const st = (await http('GET', '/api/painel/estatisticas', { token: await loginServidor() })).corpo;
  assert.equal(st.total, 0); assert.equal(st.tempoMedioDias, null);
});

test('entrypoint serve a interface da pasta public na raiz', async () => {
  const config = { ...carregarConfig({ DATA_DIR: path.join(dir, 'entrypoint') }), porta: 0 };
  const sistema = await iniciarServidor(config);
  try {
    const resposta = await fetch(`http://127.0.0.1:${sistema.servidor.address().port}/`);
    assert.equal(resposta.status, 200);
    assert.match(await resposta.text(), /Conecta Recife/);
  } finally {
    await sistema.encerrar();
  }
});

test('server.js exporta uma aplicação Express compatível com Vercel', async () => {
  const expressApp = require('../server');
  assert.equal(typeof expressApp, 'function');
  assert.equal(typeof expressApp.listen, 'function');

  const config = { ...carregarConfig({ DATA_DIR: path.join(dir, 'vercel-handler') }), porta: 0 };
  const app = criarAplicacao(config);
  const servidor = app.listen(config.porta);
  await new Promise((resolve) => servidor.once('listening', resolve));
  try {
    const resposta = await fetch(`http://127.0.0.1:${servidor.address().port}/`);
    assert.equal(resposta.status, 200);
    assert.match(await resposta.text(), /Conecta Recife/);
  } finally {
    await new Promise((resolve, reject) => {
      servidor.close((erro) => erro ? reject(erro) : resolve());
    });
    await app.encerrar();
  }
});

test('banco JSON ausente inicia vazio e conteúdo inválido não é descartado', () => {
  const arquivo = path.join(dir, 'store', 'banco.json');
  const store = new JsonStore(arquivo);
  assert.deepEqual(store.dados, { denuncias: {}, notificacoes: [], sequencias: {} });
  assert.equal(fs.existsSync(arquivo), false);

  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, '{', 'utf8');
  assert.throws(() => new JsonStore(arquivo), SyntaxError);
  assert.equal(fs.readFileSync(arquivo, 'utf8'), '{');
});

test('exige autenticação e papel correto', async () => {
  assert.equal((await http('GET', '/api/denuncias')).status, 401);
  assert.equal((await http('POST', '/api/auth/servidor', { corpo: { matricula: 'x', senha: 'y' } })).status, 401);
  assert.equal((await http('GET', '/api/painel/estatisticas', { token: await login(CPF) })).status, 403);
});

let protocolo;
test('cidadão registra denúncia: protocolo, classificação automática e histórico', async () => {
  const t = await login(CPF);
  const r = await http('POST', '/api/denuncias', { token: t, corpo: { localizacao: 'Rua da Aurora, 450 - Boa Vista', descricao: 'Poste apagado há uma semana, rua fica muito escura.' } });
  assert.equal(r.status, 201);
  protocolo = r.corpo.id;
  assert.match(protocolo, /^REC-\d{4}-00001$/);
  assert.equal(r.corpo.categoria, 'Iluminação Pública');
  assert.equal(r.corpo.status, 'RECEBIDA');
  assert.equal(r.corpo.linhaDoTempo.length, 5);
  assert.equal((await http('GET', '/api/denuncias', { token: t })).corpo.length, 1);
});

test('valida campos obrigatórios e categoria', async () => {
  const t = await login(CPF);
  assert.equal((await http('POST', '/api/denuncias', { token: t, corpo: { categoriaId: 'BURACO_VIA', localizacao: '', descricao: 'Buraco enorme na pista' } })).status, 422);
  assert.equal((await http('POST', '/api/denuncias', { token: t, corpo: { localizacao: 'Av. Conde da Boa Vista', descricao: 'Algo sem categoria definida aqui' } })).status, 422);
});

test('detecta duplicidade e vincula ao caso aberto', async () => {
  const t = await login(CPF2);
  const d = await http('GET', '/api/denuncias/duplicidade?categoriaId=ILUMINACAO&localizacao=' + encodeURIComponent('rua da aurora, 450'), { token: t });
  assert.equal(d.corpo.duplicada.id, protocolo);
  const r = await http('POST', '/api/denuncias', { token: t, corpo: { categoriaId: 'ILUMINACAO', localizacao: 'Rua da Aurora, 450', descricao: 'Mais um poste sem luz na mesma rua.' } });
  assert.equal(r.corpo.vinculadaA, protocolo);
});

test('cidadão não vê denúncia de outro cidadão', async () => {
  const t = await login('390.533.447-05');
  assert.equal((await http('GET', `/api/denuncias/${protocolo}`, { token: t })).status, 404);
});

test('servidor segue o fluxo e o cidadão é notificado', async () => {
  const s = await loginServidor(); const c = await login(CPF);
  assert.equal((await http('PATCH', `/api/denuncias/${protocolo}/status`, { token: c, corpo: { status: 'EM_ANALISE' } })).status, 403);
  assert.equal((await http('PATCH', `/api/denuncias/${protocolo}/status`, { token: s, corpo: { status: 'EM_EXECUCAO' } })).status, 409);
  for (const st of ['EM_ANALISE', 'ENCAMINHADA', 'EM_EXECUCAO', 'CONCLUIDA']) {
    const r = await http('PATCH', `/api/denuncias/${protocolo}/status`, { token: s, corpo: { status: st, observacao: 'ok' } });
    assert.equal(r.status, 200); assert.equal(r.corpo.status, st);
  }
  assert.equal((await http('PATCH', `/api/denuncias/${protocolo}/status`, { token: s, corpo: { status: 'CONCLUIDA' } })).status, 409);
  const n = (await http('GET', '/api/notificacoes', { token: c })).corpo;
  assert.equal(n.length, 5); assert.ok(n.every((x) => !x.lida));
  await http('POST', '/api/notificacoes/lidas', { token: c });
  assert.ok((await http('GET', '/api/notificacoes', { token: c })).corpo.every((x) => x.lida));
});

test('painel calcula indicadores e exporta CSV', async () => {
  const s = await loginServidor();
  const st = (await http('GET', '/api/painel/estatisticas', { token: s })).corpo;
  assert.equal(st.total, 2); assert.equal(st.concluidasMes, 1); assert.equal(st.emAndamento, 1); assert.equal(st.taxaResolucao, 50);
  assert.notEqual(st.tempoMedioDias, null);
  const csv = await http('GET', '/api/painel/relatorio.csv', { token: s });
  assert.match(csv.tipo, /text\/csv/); assert.match(csv.corpo, /REC-\d{4}-00001/);
});

test('dados persistem após reiniciar o servidor', async () => {
  const x = await subir(carregarConfig({ DATA_DIR: dir }));
  const antes = base; base = x.base;
  const lista = (await http('GET', '/api/denuncias', { token: await login(CPF) })).corpo;
  assert.equal(lista.length, 1); assert.equal(lista[0].status, 'CONCLUIDA');
  x.srv.close(); base = antes;
});

test('upload de fotos valida formato', async () => {
  const t = await login(CPF);
  const ruim = await http('POST', '/api/denuncias', { token: t, corpo: { categoriaId: 'PODA', localizacao: 'Rua do Hospício, 80', descricao: 'Galhos tocando a fiação elétrica.', fotos: ['data:text/html;base64,AAAA'] } });
  assert.equal(ruim.status, 422);
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const ok = await http('POST', '/api/denuncias', { token: t, corpo: { categoriaId: 'PODA', localizacao: 'Rua do Hospício, 80', descricao: 'Galhos tocando a fiação elétrica.', fotos: [png] } });
  assert.equal(ok.status, 201); assert.match(ok.corpo.fotos[0], /^\/uploads\/REC-\d{4}-\d{5}-1\.png$/);
  assert.equal((await fetch(base + ok.corpo.fotos[0])).status, 200);
});
