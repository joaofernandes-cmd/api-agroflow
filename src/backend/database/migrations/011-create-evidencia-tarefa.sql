-- 011 - Vincula evidencias a tarefas.

CREATE TABLE IF NOT EXISTS evidencia_tarefa (
  evidencia_id UUID NOT NULL REFERENCES evidencia(id) ON DELETE CASCADE,
  tarefa_id UUID NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
  PRIMARY KEY (evidencia_id, tarefa_id)
);
