CREATE TABLE IF NOT EXISTS ticket (
  id CHAR(36) PRIMARY KEY,
  retiro_id CHAR(36) NOT NULL,
  aberto_por CHAR(36) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('cerca', 'hidraulica', 'eletrica', 'edificacao', 'abastecimento_agua', 'outro')),
  localizacao VARCHAR(255) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('aberto', 'em_atendimento', 'resolvido', 'cancelado')),
  atribuido_a CHAR(36) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  data_criacao DATE NOT NULL,
  data_realizado DATE NOT NULL
);

ALTER TABLE ticket
  ADD CONSTRAINT ticket_retiro_id_foreign
  FOREIGN KEY (retiro_id) REFERENCES retiro(id);

ALTER TABLE ticket
  ADD CONSTRAINT ticket_aberto_por_foreign
  FOREIGN KEY (aberto_por) REFERENCES usuario(id);

ALTER TABLE ticket
  ADD CONSTRAINT ticket_atribuido_a_foreign
  FOREIGN KEY (atribuido_a) REFERENCES usuario(id);
