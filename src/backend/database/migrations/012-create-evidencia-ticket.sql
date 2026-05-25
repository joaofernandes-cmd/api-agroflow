CREATE TABLE IF NOT EXISTS evidencia_ticket (
  evidencia_id CHAR(36) NOT NULL REFERENCES evidencia(id) ON DELETE CASCADE,
  ticket_id CHAR(36) NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
  PRIMARY KEY (evidencia_id, ticket_id)
);
