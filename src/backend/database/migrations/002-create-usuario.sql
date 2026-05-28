CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retiro_id BIGINT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  status usuario_status NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  cargo usuario_cargo NOT NULL
);

ALTER TABLE usuario
  ADD CONSTRAINT usuario_retiro_id_foreign
  FOREIGN KEY (retiro_id) REFERENCES retiro(id);
