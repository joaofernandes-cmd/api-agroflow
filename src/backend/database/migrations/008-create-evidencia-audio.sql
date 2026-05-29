CREATE TABLE IF NOT EXISTS evidencia_audio (
  evidencia_id BIGINT PRIMARY KEY REFERENCES evidencia(id) ON DELETE CASCADE,
  url_arquivo TEXT NOT NULL
);
