-- 004 - Cria tabela base de movimentacoes.

CREATE TABLE IF NOT EXISTS movimentacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retiro_id UUID NOT NULL,
  capataz_id UUID NOT NULL,
  validado_por UUID NULL,
  tipo movimentacao_tipo NOT NULL,
  status movimentacao_status NOT NULL,
  sincronizado BOOLEAN NOT NULL DEFAULT false,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  estagio_vida movimentacao_estagio_vida NOT NULL,
  data_validacao TIMESTAMP NULL,
  tipo_outro TEXT
);

DO $$
BEGIN
  ALTER TABLE movimentacao
    ADD CONSTRAINT movimentacao_retiro_id_foreign
    FOREIGN KEY (retiro_id) REFERENCES retiro(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE movimentacao
    ADD CONSTRAINT movimentacao_capataz_id_foreign
    FOREIGN KEY (capataz_id) REFERENCES usuario(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE movimentacao
    ADD CONSTRAINT movimentacao_validado_por_foreign
    FOREIGN KEY (validado_por) REFERENCES usuario(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
