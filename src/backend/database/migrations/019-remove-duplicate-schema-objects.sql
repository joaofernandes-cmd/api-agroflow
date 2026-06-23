-- 019 - Remove constraints e tipos legados.

ALTER TABLE usuario
  DROP CONSTRAINT IF EXISTS usuario_retiro_id_fkey;

ALTER TABLE tarefa
  DROP CONSTRAINT IF EXISTS tarefa_retiro_id_fkey,
  DROP CONSTRAINT IF EXISTS tarefa_criada_por_fkey,
  DROP CONSTRAINT IF EXISTS tarefa_atribuida_a_fkey,
  DROP CONSTRAINT IF EXISTS tarefa_aprovado_por_fkey;

ALTER TABLE movimentacao
  DROP CONSTRAINT IF EXISTS movimentacao_retiro_id_fkey,
  DROP CONSTRAINT IF EXISTS movimentacao_capataz_id_fkey,
  DROP CONSTRAINT IF EXISTS movimentacao_validado_por_fkey;

ALTER TABLE ticket
  DROP CONSTRAINT IF EXISTS ticket_retiro_id_fkey,
  DROP CONSTRAINT IF EXISTS ticket_aberto_por_fkey,
  DROP CONSTRAINT IF EXISTS ticket_atribuido_a_fkey,
  DROP CONSTRAINT IF EXISTS ticket_aprovado_por_fkey;

ALTER TABLE evidencia
  DROP CONSTRAINT IF EXISTS evidencia_usuario_id_fkey;

DROP TYPE IF EXISTS estagio_vida_enum;
DROP TYPE IF EXISTS fazenda_local;
