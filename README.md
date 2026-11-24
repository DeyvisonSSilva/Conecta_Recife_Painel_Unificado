# Painel Único de Denúncias – Conecta Recife (AV2)

Aplicação web funcional: back-end Node.js/Express (API REST), front-end SPA em JavaScript puro com o design do Figma e persistência em arquivo JSON **ou** PostgreSQL. O sistema **inicia sem nenhuma denúncia**; tudo que o cidadão cadastra fica armazenado.

## Como executar
```bash
npm install
npm start          # http://localhost:3000
npm test           # 11 testes automatizados da API e regras de negócio
```
Requer Node.js 18+.

| Perfil | Acesso |
|---|---|
| Cidadão | Tela de login → **CPF ou CNPJ válido** (ex.: `529.982.247-25`) → "Entrar com Conecta Login" |
| Servidor | Link "Acesso do servidor público" → matrícula `carlos.lima`, senha `recife123` (altere em `.env.example`) |

`gov.br` e Certificado Digital são botões do Figma ainda sem integração (previstos para depois).

## Regras implementadas
- **Protocolo único** gerado automaticamente (`REC-AAAA-00001`), sequencial por ano.
- **Classificação automática** da categoria e da secretaria a partir da descrição (`ClassificadorPorPalavrasChave`).
- **Fluxo rastreável**: Recebida › Em Análise › Encaminhada › Em Execução › Concluída. Só é permitido avançar à etapa seguinte; cada passo guarda data, autor e observação.
- **Linha do tempo** visível ao cidadão e ao servidor, com o órgão responsável e a previsão de conclusão por categoria.
- **Duplicidade**: aviso ao cidadão e vínculo (`vinculadaA`) quando já existe denúncia aberta da mesma categoria e local.
- **Gestão**: tempo médio de resposta, taxa de resolução, recebidas/concluídas no mês, visão por secretaria e por categoria, filtros/busca e exportação CSV.
- **Autenticação** com token assinado (HMAC) e perfis; o cidadão só enxerga as próprias denúncias.
- **Notificações** ao cidadão a cada registro/mudança de status (no app + e-mail simulado no console).
- **Fotos** (até 3, 2 MB, PNG/JPG/WEBP) salvas em `data/uploads`.

## Arquitetura e SOLID
```
src/domain          entidades e regras (Denuncia, StatusDenuncia, CatalogoCategorias, Documento)
src/application     casos de uso (DenunciaService, PainelService, NotificacaoService, AutenticacaoService…)
src/infrastructure  adaptadores: JSON, PostgreSQL, TokenService
src/interfaces/http rotas Express, middlewares e tratamento de erros
src/composicao.js   composition root (único lugar que conhece as classes concretas)
public/             front-end (js/views = uma tela por função; layout.js, ui.js, api.js)
```
- **S** – cada classe tem uma responsabilidade (ex.: `GeradorProtocolo`, `GeradorCsv`, `ArmazenamentoFotosLocal`).
- **O** – nova categoria = nova entrada em `CatalogoCategorias`; novo canal de aviso = nova classe com `enviar()`.
- **L** – `JsonDenunciaRepository` e `PostgresDenunciaRepository` são intercambiáveis.
- **I** – contratos pequenos (`DenunciaRepository`, `NotificacaoRepository`, canais com um único método).
- **D** – serviços recebem repositórios, relógio, eventos e classificador por injeção; só `composicao.js` instancia as concretas.

## PostgreSQL (opcional)
```bash
createdb conecta_recife
DATABASE_URL=postgres://usuario:senha@localhost:5432/conecta_recife npm start
```
O esquema (`db/schema.sql`) é aplicado automaticamente na inicialização.

## API (resumo)
`POST /api/auth/cidadao` · `POST /api/auth/servidor` · `GET /api/categorias` · `POST /api/classificacao` · `GET|POST /api/denuncias` · `GET /api/denuncias/:id` · `PATCH /api/denuncias/:id/status` · `GET /api/denuncias/duplicidade` · `GET /api/notificacoes` · `GET /api/painel/estatisticas` · `GET /api/painel/relatorio.csv`

## Limitações conhecidas
- O mapa é ilustrativo: guarda o ponto clicado, sem mapa real/geocodificação.
- Não há limite de tentativas de login, recuperação de senha nem cadastro de servidores (credencial única por variável de ambiente). Troque `AUTH_SECRET` e a senha antes de publicar.
- E-mail/push são simulados; a integração real entra pelo `NotificacaoService` sem mudar o restante.
- O banco JSON atende um único processo; para vários usuários simultâneos use PostgreSQL.
