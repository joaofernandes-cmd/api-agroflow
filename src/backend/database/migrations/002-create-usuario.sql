-- 002 - Cria tabela de usuarios.

CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retiro_id UUID NOT NULL,
  nome VARCHAR(255) NOT NULL,
  identificador VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE,
  senha_hash VARCHAR(255),
  status usuario_status NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  cargo usuario_cargo NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS usuario_identificador_unique
  ON usuario (identificador);

DO $$
BEGIN
  ALTER TABLE usuario
    ADD CONSTRAINT usuario_retiro_id_foreign
    FOREIGN KEY (retiro_id) REFERENCES retiro(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
