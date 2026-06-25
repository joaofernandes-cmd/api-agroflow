-- 014 - Cria detalhe de movimentacao do tipo compra.

CREATE TABLE IF NOT EXISTS movimentacao_compra (
  movimentacao_id UUID PRIMARY KEY,
  destino VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL,
  FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id),
  CHECK (quantidade > 0)
);
