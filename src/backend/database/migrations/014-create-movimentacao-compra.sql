CREATE TABLE IF NOT EXISTS movimentacao_compra (
  movimentacao_id BIGINT PRIMARY KEY,
  quantidade INT NOT NULL,
  FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id),
  CHECK (quantidade > 0)
);
