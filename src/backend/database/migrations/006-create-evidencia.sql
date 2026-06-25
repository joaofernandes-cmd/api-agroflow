-- 006 - Cria tabela base de evidencias.

CREATE TABLE IF NOT EXISTS evidencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  tipo evidencia_tipo NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE evidencia
    ADD CONSTRAINT evidencia_usuario_id_foreign
    FOREIGN KEY (usuario_id) REFERENCES usuario(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
