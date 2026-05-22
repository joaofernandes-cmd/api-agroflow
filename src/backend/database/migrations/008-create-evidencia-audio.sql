CREATE TABLE IF NOT EXISTS evidencia_audio (
  evidencia_id CHAR(36) PRIMARY KEY REFERENCES evidencia(id) ON DELETE CASCADE,
  url_arquivo TEXT NOT NULL
);
