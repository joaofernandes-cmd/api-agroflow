CREATE TABLE IF NOT EXISTS evidencia_movimentacao (
  evidencia_id BIGINT NOT NULL REFERENCES evidencia(id) ON DELETE CASCADE,
  movimentacao_id BIGINT NOT NULL REFERENCES movimentacao(id) ON DELETE CASCADE,
  PRIMARY KEY (evidencia_id, movimentacao_id)
);
