ALTER TABLE ticket
  ADD COLUMN IF NOT EXISTS aprovado_por UUID NULL,
  ADD CONSTRAINT ticket_aprovado_por_foreign
    FOREIGN KEY (aprovado_por) REFERENCES usuario(id);

ALTER TABLE tarefa
  ADD COLUMN IF NOT EXISTS aprovado_por UUID NULL,
  ADD CONSTRAINT tarefa_aprovado_por_foreign
    FOREIGN KEY (aprovado_por) REFERENCES usuario(id);
