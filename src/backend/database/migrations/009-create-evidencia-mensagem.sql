CREATE TABLE IF NOT EXISTS evidencia_mensagem (
  evidencia_id BIGINT PRIMARY KEY REFERENCES evidencia(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL
);
