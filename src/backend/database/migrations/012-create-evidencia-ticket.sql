CREATE TABLE IF NOT EXISTS evidencia_ticket (
  evidencia_id BIGINT NOT NULL REFERENCES evidencia(id) ON DELETE CASCADE,
  ticket_id BIGINT NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
  PRIMARY KEY (evidencia_id, ticket_id)
);
