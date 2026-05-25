CREATE TABLE IF NOT EXISTS usuario (
  id CHAR(36) PRIMARY KEY,
  retiro_id CHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo')),
  data_criacao TIMESTAMP NOT NULL,
  cargo TEXT NOT NULL CHECK (cargo IN ('capataz', 'supervisor', 'gerente'))
);

ALTER TABLE usuario
  ADD CONSTRAINT usuario_retiro_id_foreign
  FOREIGN KEY (retiro_id) REFERENCES retiro(id);
