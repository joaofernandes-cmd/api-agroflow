-- Adiciona o status intermediário "concluido" ao ciclo de vida da tarefa.
-- Ciclo: pendente (delegada ao capataz)
--        → concluido (capataz concluiu e enviou evidência; aguarda o supervisor)
--        → aprovado  (supervisor validou; exibido como "Validada" na interface).
ALTER TYPE tarefa_status ADD VALUE IF NOT EXISTS 'concluido' AFTER 'pendente';
