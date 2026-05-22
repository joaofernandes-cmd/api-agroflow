CREATE TABLE IF NOT EXISTS evidencia (
  id CHAR(36) PRIMARY KEY,
  usuario_id CHAR(36) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'audio', 'mensagem')),
  data_criacao TIMESTAMP NOT NULL
);

ALTER TABLE evidencia
  ADD CONSTRAINT evidencia_usuario_id_foreign
  FOREIGN KEY (usuario_id) REFERENCES usuario(id);
