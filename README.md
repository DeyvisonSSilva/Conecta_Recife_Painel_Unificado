<div align="center">

# 📍 Painel Único de Denúncias – Conecta Recife

**Um fluxo único e rastreável para as denúncias da cidade, do registro à conclusão.**

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-opcional-4169E1?logo=postgresql&logoColor=white)
![Testes](https://img.shields.io/badge/testes-14%20passando-brightgreen)
![Projeto](https://img.shields.io/badge/projeto-acad%C3%AAmico%20(AV2)-1777e5)

</div>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Telas](#telas)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Configuração](#configuração)
- [Usando PostgreSQL](#usando-postgresql)
- [Deploy na Vercel](#deploy-na-vercel)
- [Arquitetura e SOLID](#arquitetura-e-solid)
- [API REST](#api-rest)
- [Testes](#testes)
- [Limitações conhecidas](#limitações-conhecidas)
- [Próximos passos](#próximos-passos)
- [Equipe](#equipe)

## Sobre o projeto

Projeto da disciplina **Ciência de Dados** (turma 5NNA, Grupo 2), desenvolvido a partir do desafio do Banco de Oportunidades (Coreto): **Fragmentação do Tratamento de Denúncias Recebidas via Conecta Recife**.

### O problema

Hoje, quando o cidadão registra uma denúncia (buraco na via, iluminação pública, poda de árvores, descarte irregular de entulho…), ela é distribuída entre diferentes secretarias e órgãos **sem um fluxo unificado de acompanhamento**. Isso causa:

- o cidadão perde a visibilidade do andamento e não sabe para qual órgão o pedido foi encaminhado;
- retrabalho e duplicidade quando mais de uma secretaria trata o mesmo caso isoladamente;
- ausência de um histórico centralizado que permita medir tempo de resposta e taxa de resolução;
- perda de confiança no canal oficial e dificuldade da gestão em priorizar demandas.

### A solução

O **Painel Único de Denúncias** é um módulo do Conecta Recife que funciona como um *hub*: recebe a denúncia, gera um **protocolo único**, **classifica automaticamente** a categoria e a secretaria responsável e exibe uma **linha do tempo de status** visível tanto ao cidadão quanto ao servidor:

```
Recebida  →  Em Análise  →  Encaminhada  →  Em Execução  →  Concluída
```

O sistema **inicia vazio**: todas as denúncias são cadastradas pelos usuários e ficam armazenadas na aplicação.

## Funcionalidades

### Cidadão
- Login por **CPF ou CNPJ** (com validação dos dígitos verificadores) e opção "Mantenha-me conectado".
- **Nova denúncia** com categoria, localização, ponto no mapa, descrição e até 3 fotos (PNG/JPG/WEBP, 2 MB cada).
- **Classificação automática**: se a categoria não for escolhida, ela é sugerida a partir da descrição.
- **Aviso de duplicidade**: alerta quando já existe denúncia aberta da mesma categoria e local; a nova é vinculada ao caso existente.
- **Protocolo único** (`REC-AAAA-00001`) e tela de confirmação.
- **Minhas denúncias** com filtros (Todas, Em andamento, Concluídas) e **detalhe com linha do tempo**, órgão responsável e previsão de conclusão.
- **Notificações** a cada registro e mudança de status.

### Servidor público
- Acesso por matrícula e senha.
- **Fila de denúncias** com indicadores: recebidas e concluídas no mês, em andamento e **tempo médio de resposta**.
- **Atualização do andamento** (uma etapa por vez, com observação visível ao cidadão e histórico de autor e data).
- **Busca e filtros** por protocolo, local, status e categoria.
- Visões por **secretaria** e **relatórios** (por categoria e por status, taxa de resolução).
- **Exportação do relatório em CSV**.

## Telas

O front-end segue o protótipo do Figma (cores, fonte Inter, logotipos da Prefeitura do Recife e da Emprel):

| Perfil | Telas |
|---|---|
| Cidadão | Login · Início · Minhas Denúncias · Nova Denúncia · Confirmação · Detalhes da Denúncia · Notificações |
| Servidor | Login do servidor · Visão Geral (Fila de Denúncias) · Denúncias · Detalhe com atualização de status · Secretarias · Relatórios · Configurações |

> 💡 Adicione capturas de tela em `docs/` e referencie aqui para enriquecer o repositório.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Back-end | Node.js (≥ 18), Express 4 |
| Persistência | Arquivo JSON (padrão, sem configuração) **ou** PostgreSQL (`pg`) |
| Front-end | JavaScript puro (ES Modules), HTML e CSS — sem etapa de build |
| Autenticação | Token assinado com HMAC-SHA256 (módulo `crypto` do Node) |
| Testes | `node:test` (executor nativo do Node) |

## Como executar

**Pré-requisito:** [Node.js](https://nodejs.org/) 18 ou superior.

```bash
git clone <url-do-repositorio>
cd conecta-recife-painel-unico
npm install
npm start
```

Acesse **http://localhost:3000**.

### Acessos de demonstração

| Perfil | Como entrar |
|---|---|
| **Cidadão** | Informe um CPF/CNPJ válido (ex.: `529.982.247-25`) e clique em **Entrar com Conecta Login** |
| **Servidor** | Na tela de login, clique em **Acesso do servidor público** · matrícula `carlos.lima` · senha `recife123` |

> Os botões **gov.br** e **Certificado Digital** da tela de login existem no design, mas ainda não têm integração.

### Roteiro rápido para testar

1. Entre como cidadão e registre uma denúncia em **Nova Denúncia**.
2. Anote o protocolo exibido na confirmação.
3. Saia, entre como servidor e abra a denúncia pela fila; avance o status.
4. Volte como o mesmo cidadão e veja a linha do tempo e a notificação.

## Configuração

Variáveis de ambiente (veja `.env.example`):

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `DATA_DIR` | `./data` | Pasta do banco JSON e das fotos enviadas |
| `DATABASE_URL` | *(vazio)* | Se definida, usa PostgreSQL em vez do arquivo JSON |
| `AUTH_SECRET` | `troque-este-segredo-em-producao` | Segredo de assinatura dos tokens — **troque em produção** |
| `SERVIDOR_MATRICULA` / `SERVIDOR_SENHA` | `carlos.lima` / `recife123` | Credencial do servidor — **troque em produção** |
| `SERVIDOR_NOME` / `SERVIDOR_SETOR` | `Carlos Lima` / `Secretaria de Infraestrutura` | Dados exibidos do servidor |
| `VALIDAR_DOCUMENTO` | `true` | Use `false` para aceitar CPF/CNPJ sem checar os dígitos verificadores |

Exemplo:

```bash
AUTH_SECRET="um-segredo-longo-e-aleatorio" SERVIDOR_SENHA="outra-senha" npm start
```

## Usando PostgreSQL

```bash
createdb conecta_recife
DATABASE_URL=postgres://usuario:senha@localhost:5432/conecta_recife npm start
```

O esquema ([`db/schema.sql`](db/schema.sql)) é aplicado automaticamente na inicialização. Não é preciso alterar código: a escolha do banco é feita apenas na composição das dependências.

## Deploy na Vercel

A Vercel carrega `server.js` como uma aplicação Express; os arquivos de `public/` são servidos pela CDN. Configure em **Project Settings → Environment Variables**:

| Variável | Necessidade |
|---|---|
| `DATABASE_URL` | Obrigatória: URL de um PostgreSQL externo acessível pela Vercel |
| `AUTH_SECRET` | Obrigatória em produção: segredo longo e aleatório |
| `SERVIDOR_MATRICULA` / `SERVIDOR_SENHA` | Credenciais do perfil servidor |

Sem `DATABASE_URL`, a inicialização do backend na Vercel falha explicitamente: o sistema de arquivos das funções não é persistente e pode ser somente leitura. As fotos ainda usam armazenamento local; para persistir uploads em produção, integre um serviço externo de armazenamento de objetos.

## Arquitetura e SOLID

```
├── server.js                      ponto de entrada
├── db/schema.sql                  esquema PostgreSQL
├── public/                        front-end (SPA)
│   ├── js/views/                  uma função por tela (login, cidadão, detalhe, servidor)
│   ├── js/{api,sessao,ui,layout,main}.js
│   ├── css/app.css
│   └── assets/                    logotipos
├── src/
│   ├── domain/                    entidades e regras de negócio
│   ├── application/               casos de uso e serviços
│   ├── infrastructure/            adaptadores (JSON, PostgreSQL, token)
│   ├── interfaces/http/           rotas Express, middlewares, tratamento de erros
│   ├── composicao.js              composition root
│   └── config.js
└── test/                          testes automatizados
```

| Princípio | Como foi aplicado |
|---|---|
| **S** – Responsabilidade única | Classes pequenas e focadas: `GeradorProtocolo`, `GeradorCsv`, `ClassificadorPorPalavrasChave`, `ArmazenamentoFotosLocal`, `PainelService` |
| **O** – Aberto/fechado | Nova categoria = uma entrada em `CatalogoCategorias`; novo canal de aviso = uma classe com o método `enviar()` |
| **L** – Substituição de Liskov | `JsonDenunciaRepository` e `PostgresDenunciaRepository` cumprem o mesmo contrato e são intercambiáveis |
| **I** – Segregação de interfaces | Contratos enxutos: `DenunciaRepository`, `NotificacaoRepository`, canais de notificação com um único método |
| **D** – Inversão de dependência | Os serviços recebem repositórios, relógio, eventos e classificador por injeção; só `composicao.js` instancia as classes concretas |

A regra do fluxo de status (somente avançar à etapa seguinte) mora na entidade `Denuncia`, e as notificações são disparadas por eventos de domínio (`denuncia.registrada`, `denuncia.status_alterado`), mantendo o caso de uso desacoplado dos canais.

## API REST

Autenticação por cabeçalho `Authorization: Bearer <token>` (obtido nas rotas de login).

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/cidadao` | público | Login do cidadão (`{ documento }`) |
| `POST` | `/api/auth/servidor` | público | Login do servidor (`{ matricula, senha }`) |
| `GET` | `/api/auth/eu` | logado | Usuário da sessão |
| `GET` | `/api/categorias` | público | Catálogo de categorias e secretarias |
| `POST` | `/api/classificacao` | logado | Sugere a categoria a partir da descrição |
| `POST` | `/api/denuncias` | cidadão | Registra denúncia |
| `GET` | `/api/denuncias` | logado | Lista (cidadão: só as suas) — filtros `status`, `categoriaId`, `busca` |
| `GET` | `/api/denuncias/:id` | logado | Detalhe com linha do tempo |
| `GET` | `/api/denuncias/duplicidade` | cidadão | Verifica denúncia aberta parecida (`categoriaId`, `localizacao`) |
| `PATCH` | `/api/denuncias/:id/status` | servidor | Avança o status (`{ status, observacao }`) |
| `GET` / `POST` | `/api/notificacoes` · `/api/notificacoes/lidas` | cidadão | Lista / marca como lidas |
| `GET` | `/api/painel/estatisticas` | servidor | Indicadores de gestão |
| `GET` | `/api/painel/relatorio.csv` | servidor | Exporta o relatório em CSV |

**Exemplo — registrar uma denúncia:**

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/cidadao \
  -H 'Content-Type: application/json' \
  -d '{"documento":"529.982.247-25"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -X POST localhost:3000/api/denuncias \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"localizacao":"Rua da Aurora, 450 - Boa Vista","descricao":"Buraco grande próximo à esquina, risco a motociclistas."}'
```

Erros seguem o formato `{ "erro": "mensagem" }` com os códigos `401`, `403`, `404`, `409` (transição de status inválida) e `422` (validação).

## Testes

```bash
npm test
```

Os 14 testes cobrem: validação de CPF/CNPJ, inicialização e handler Express, armazenamento JSON inválido, autenticação e papéis, registro com protocolo e classificação automática, validações, duplicidade, isolamento entre cidadãos, fluxo de status com notificações, indicadores e CSV, **persistência após reiniciar o servidor** e validação de upload de fotos.

## Limitações conhecidas

- O mapa é ilustrativo: guarda o ponto clicado, sem mapa real nem geocodificação.
- Há uma única credencial de servidor (variáveis de ambiente), sem cadastro de servidores, recuperação de senha ou limite de tentativas de login.
- O login do cidadão exige apenas CPF/CNPJ válido (não há senha nem verificação de identidade); gov.br e Certificado Digital não estão integrados.
- E-mail e push são simulados (mensagem no console); as notificações ficam disponíveis dentro do aplicativo.
- O banco JSON atende a um único processo; para uso simultâneo, utilize PostgreSQL.
- O armazenamento local de fotos não é persistente na Vercel; use um serviço externo de arquivos para produção.
- Antes de publicar em produção: trocar `AUTH_SECRET` e a senha do servidor, servir via HTTPS e adicionar limite de requisições.

## Próximos passos

- Integração com gov.br e certificado digital.
- Mapa real (geolocalização e endereço automático).
- Envio de e-mail e push reais.
- Cadastro e perfis de servidores por secretaria, com atribuição de responsáveis.
- Classificação por modelo de linguagem/ML no lugar de palavras-chave.
- Painel com séries temporais e mapa de calor de ocorrências.

## Equipe

**Grupo 2 · Ciência de Dados · Turma 5NNA**

| Integrante | Matrícula |
|---|---|
| Deyvison Francisco | 01750371 |
| Augusto Alves | 01751499 |
| Adilson Pedro | 01751877 |
| Leticia Rodrigues | 01612042 |
| Pedro Lucas | 01750440 |

---

<div align="center">

Projeto acadêmico · Desafio do Banco de Oportunidades (Coreto) · Conecta Recife

</div>
