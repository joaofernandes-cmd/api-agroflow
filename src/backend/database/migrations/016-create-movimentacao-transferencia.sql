-- 016 - Cria detalhe de movimentacao do tipo transferencia.

CREATE TABLE IF NOT EXISTS movimentacao_transferencia (
  movimentacao_id UUID PRIMARY KEY,
  origem VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL,
  FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id),
  CHECK (quantidade > 0)
);
