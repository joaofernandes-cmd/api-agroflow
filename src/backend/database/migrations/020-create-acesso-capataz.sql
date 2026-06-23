CREATE TABLE IF NOT EXISTS acesso_capataz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_expiracao TIMESTAMPTZ,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS acesso_capataz_usuario_id_idx
  ON acesso_capataz (usuario_id);

INSERT INTO acesso_capataz (usuario_id, token_hash, ativo)
SELECT id, 'a858669b3c392f03e4b62383ad1118142a18ad745a5c9b7de0edb8e2453f39c2', true
FROM usuario
WHERE login = 'capataz@agroflow.com'
ON CONFLICT (token_hash) DO NOTHING;
