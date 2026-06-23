-- 021 - Compatibilidade historica da conversao para UUID.
-- O schema atual ja cria IDs e FKs como UUID desde as migrations iniciais.
-- Mantemos este arquivo para preservar a ordem e o nome registrado em schema_migrations.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'retiro'
      AND column_name = 'id'
      AND data_type = 'bigint'
  ) THEN
    RAISE EXCEPTION 'Schema legado com BIGINT detectado. Use a versao anterior da migration 021 para converter dados existentes antes de aplicar o schema simplificado.';
  END IF;
END $$;
