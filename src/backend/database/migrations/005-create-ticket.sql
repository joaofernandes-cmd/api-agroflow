-- 005 - Cria tabela de tickets.

CREATE TABLE IF NOT EXISTS ticket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retiro_id UUID NOT NULL,
  aberto_por UUID NOT NULL,
  categoria ticket_categoria NOT NULL,
  localizacao VARCHAR(255) NOT NULL,
  status ticket_status NOT NULL,
  atribuido_a UUID NULL,
  aprovado_por UUID NULL,
  descricao VARCHAR(255) NOT NULL,
  prioridade ticket_prioridade NOT NULL,
  sincronizado BOOLEAN NOT NULL DEFAULT false,
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_realizado DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria_outro TEXT,
  CONSTRAINT ticket_categoria_restrita_check CHECK (categoria IN ('cerca', 'eletrica', 'hidraulica'))
);

DO $$
BEGIN
  BEGIN
    ALTER TABLE ticket
      ADD CONSTRAINT ticket_retiro_id_foreign
      FOREIGN KEY (retiro_id) REFERENCES retiro(id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER TABLE ticket
      ADD CONSTRAINT ticket_aberto_por_foreign
      FOREIGN KEY (aberto_por) REFERENCES usuario(id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER TABLE ticket
      ADD CONSTRAINT ticket_atribuido_a_foreign
      FOREIGN KEY (atribuido_a) REFERENCES usuario(id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER TABLE ticket
      ADD CONSTRAINT ticket_aprovado_por_foreign
      FOREIGN KEY (aprovado_por) REFERENCES usuario(id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
