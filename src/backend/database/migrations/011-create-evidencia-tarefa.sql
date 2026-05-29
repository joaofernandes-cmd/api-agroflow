CREATE TABLE IF NOT EXISTS evidencia_tarefa (
  evidencia_id BIGINT NOT NULL REFERENCES evidencia(id) ON DELETE CASCADE,
  tarefa_id BIGINT NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
  PRIMARY KEY (evidencia_id, tarefa_id)
);
