CREATE TABLE IF NOT EXISTS movimentacao_morte (
  movimentacao_id BIGINT PRIMARY KEY,
  origem VARCHAR(255) NOT NULL,
  causa_obito VARCHAR(255) NOT NULL,
  FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id)
);
