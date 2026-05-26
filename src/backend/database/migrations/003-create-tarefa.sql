CREATE TABLE IF NOT EXISTS tarefa (
  id CHAR(36) PRIMARY KEY,
  retiro_id CHAR(36) NOT NULL,
  criada_por CHAR(36) NOT NULL,
  atribuida_a CHAR(36) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('alta', 'media', 'baixa')),
  data_criacao TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada'))
);

ALTER TABLE tarefa
  ADD CONSTRAINT tarefa_retiro_id_foreign
  FOREIGN KEY (retiro_id) REFERENCES retiro(id);

ALTER TABLE tarefa
  ADD CONSTRAINT tarefa_criada_por_foreign
  FOREIGN KEY (criada_por) REFERENCES usuario(id);

ALTER TABLE tarefa
  ADD CONSTRAINT tarefa_atribuida_a_foreign
  FOREIGN KEY (atribuida_a) REFERENCES usuario(id);
