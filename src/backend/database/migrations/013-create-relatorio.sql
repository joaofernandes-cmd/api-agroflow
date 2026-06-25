-- 013 - Cria a tabela de relatorios.
-- Prefixo duplicado preservado para nao reexecutar migrations ja aplicadas.

CREATE TABLE IF NOT EXISTS relatorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gerado_por UUID NOT NULL,
  retiro_id UUID NOT NULL,
  tipo relatorio_tipo NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_gerado TIMESTAMP NOT NULL DEFAULT NOW(),
  url_arquivo TEXT NOT NULL,
  FOREIGN KEY (gerado_por) REFERENCES usuario(id),
  FOREIGN KEY (retiro_id) REFERENCES retiro(id)
);
