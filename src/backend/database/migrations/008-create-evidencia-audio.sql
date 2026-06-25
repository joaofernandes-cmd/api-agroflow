-- 008 - Cria detalhe de evidencia do tipo audio.

CREATE TABLE IF NOT EXISTS evidencia_audio (
  evidencia_id UUID PRIMARY KEY REFERENCES evidencia(id) ON DELETE CASCADE,
  url_arquivo TEXT NOT NULL
);
