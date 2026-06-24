-- 017 - Cria detalhe de movimentacao do tipo nascimento.

CREATE TABLE IF NOT EXISTS movimentacao_nascimento (
  movimentacao_id UUID PRIMARY KEY,
  origem VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL,
  FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id),
  CHECK (quantidade > 0)
);
