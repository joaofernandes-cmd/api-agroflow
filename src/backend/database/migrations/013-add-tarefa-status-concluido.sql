-- 013 - Adiciona o status concluido ao fluxo de tarefas.

ALTER TYPE tarefa_status ADD VALUE IF NOT EXISTS 'concluido' AFTER 'pendente';
