-- 023 - Separa identificador operacional de login/senha.

ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS identificador VARCHAR(255);

UPDATE usuario
SET identificador = COALESCE(
  identificador,
  CASE
    WHEN cargo = 'capataz' THEN 'capataz-' || regexp_replace(lower(split_part(COALESCE(login, nome), '@', 1)), '[^a-z0-9]+', '-', 'g')
    WHEN cargo = 'supervisor' THEN 'supervisor-' || regexp_replace(lower(split_part(COALESCE(login, nome), '@', 1)), '[^a-z0-9]+', '-', 'g')
    WHEN cargo = 'gerente' THEN 'gerente-' || regexp_replace(lower(split_part(COALESCE(login, nome), '@', 1)), '[^a-z0-9]+', '-', 'g')
    ELSE regexp_replace(lower(COALESCE(login, nome)), '[^a-z0-9]+', '-', 'g')
  END
);

ALTER TABLE usuario
  ALTER COLUMN identificador SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usuario_identificador_unique
  ON usuario (identificador);

ALTER TABLE usuario
  ALTER COLUMN login DROP NOT NULL,
  ALTER COLUMN senha_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usuario_login_unique_not_null
  ON usuario (login)
  WHERE login IS NOT NULL;

UPDATE usuario
SET login = NULL,
    senha_hash = NULL
WHERE cargo = 'capataz';
