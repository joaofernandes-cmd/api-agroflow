-- 007 - Cria detalhe de evidencia do tipo foto.

CREATE TABLE IF NOT EXISTS evidencia_foto (
  evidencia_id UUID PRIMARY KEY REFERENCES evidencia(id) ON DELETE CASCADE,
  url_arquivo TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);
