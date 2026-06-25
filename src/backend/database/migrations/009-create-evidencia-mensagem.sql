-- 009 - Cria detalhe de evidencia do tipo mensagem.

CREATE TABLE IF NOT EXISTS evidencia_mensagem (
  evidencia_id UUID PRIMARY KEY REFERENCES evidencia(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL
);
