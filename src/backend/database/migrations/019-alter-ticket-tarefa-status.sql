-- Altera ticket_status: remove estados antigos, mantém apenas pendente e aprovado
ALTER TYPE ticket_status RENAME TO ticket_status_old;

CREATE TYPE ticket_status AS ENUM ('pendente', 'aprovado');

ALTER TABLE ticket
  ALTER COLUMN status TYPE ticket_status
  USING CASE
    WHEN status::text = 'aprovado' THEN 'aprovado'::ticket_status
    ELSE 'pendente'::ticket_status
  END;

DROP TYPE ticket_status_old;

-- Altera tarefa_status: remove estados antigos, mantém apenas pendente e aprovado
ALTER TYPE tarefa_status RENAME TO tarefa_status_old;

CREATE TYPE tarefa_status AS ENUM ('pendente', 'aprovado');

ALTER TABLE tarefa
  ALTER COLUMN status TYPE tarefa_status
  USING CASE
    WHEN status::text = 'aprovado' THEN 'aprovado'::tarefa_status
    ELSE 'pendente'::tarefa_status
  END;

DROP TYPE tarefa_status_old;
