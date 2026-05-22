CREATE TABLE IF NOT EXISTS movimentacao (
  id CHAR(36) PRIMARY KEY,
  retiro_id CHAR(36) NOT NULL,
  capataz_id CHAR(36) NOT NULL,
  validado_por CHAR(36) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('nascimento', 'morte', 'transferencia', 'compra', 'venda', 'outros')),
  origem TEXT NULL,
  destino TEXT NULL,
  quantidade INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  sincronizado BOOLEAN NOT NULL DEFAULT false,
  data_criacao TIMESTAMP NOT NULL,
  causa_obito VARCHAR(255) NULL,
  estagio_vida TEXT NOT NULL,
  CHECK (tipo != 'morte' OR causa_obito IS NOT NULL),
  CHECK (tipo != 'transferencia' OR (origem IS NOT NULL AND destino IS NOT NULL))
);

ALTER TABLE movimentacao
  ADD CONSTRAINT movimentacao_retiro_id_foreign
  FOREIGN KEY (retiro_id) REFERENCES retiro(id);

ALTER TABLE movimentacao
  ADD CONSTRAINT movimentacao_capataz_id_foreign
  FOREIGN KEY (capataz_id) REFERENCES usuario(id);

ALTER TABLE movimentacao
  ADD CONSTRAINT movimentacao_validado_por_foreign
  FOREIGN KEY (validado_por) REFERENCES usuario(id);
