CREATE TABLE IF NOT EXISTS relatorio (
  id CHAR(36) PRIMARY KEY,
  gerado_por CHAR(36) NOT NULL,
  retiro_id CHAR(36) NOT NULL,
  tipo TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_gerado TIMESTAMP NOT NULL DEFAULT NOW(),
  url_arquivo TEXT NOT NULL,
  FOREIGN KEY (gerado_por) REFERENCES usuario(id),
  FOREIGN KEY (retiro_id) REFERENCES retiro(id)
);
