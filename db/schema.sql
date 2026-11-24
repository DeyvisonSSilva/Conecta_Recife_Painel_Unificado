CREATE TABLE IF NOT EXISTS protocolo_seq (ano INT PRIMARY KEY, ultimo INT NOT NULL);
CREATE TABLE IF NOT EXISTS denuncias (
  id            TEXT PRIMARY KEY,
  categoria_id  TEXT NOT NULL,
  categoria     TEXT NOT NULL,
  secretaria    TEXT NOT NULL,
  prazo_dias    INT  NOT NULL,
  localizacao   TEXT NOT NULL,
  coordenadas   JSONB,
  descricao     TEXT NOT NULL,
  fotos         JSONB NOT NULL DEFAULT '[]',
  cidadao_id    TEXT NOT NULL,
  vinculada_a   TEXT,
  status        TEXT NOT NULL,
  historico     JSONB NOT NULL,
  criada_em     TIMESTAMPTZ NOT NULL,
  atualizada_em TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_denuncias_cidadao ON denuncias(cidadao_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status);
CREATE TABLE IF NOT EXISTS notificacoes (
  id          TEXT PRIMARY KEY,
  usuario_id  TEXT NOT NULL,
  denuncia_id TEXT NOT NULL,
  mensagem    TEXT NOT NULL,
  criada_em   TIMESTAMPTZ NOT NULL,
  lida        BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
