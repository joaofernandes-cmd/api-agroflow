CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE retiro ADD COLUMN id_uuid UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE movimentacao ADD COLUMN id_uuid UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE tarefa ADD COLUMN id_uuid UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE ticket ADD COLUMN id_uuid UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE evidencia ADD COLUMN id_uuid UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE relatorio ADD COLUMN id_uuid UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE usuario ADD COLUMN retiro_id_uuid UUID;
ALTER TABLE movimentacao ADD COLUMN retiro_id_uuid UUID;
ALTER TABLE tarefa ADD COLUMN retiro_id_uuid UUID;
ALTER TABLE ticket ADD COLUMN retiro_id_uuid UUID;
ALTER TABLE relatorio ADD COLUMN retiro_id_uuid UUID;

ALTER TABLE evidencia_foto ADD COLUMN evidencia_id_uuid UUID;
ALTER TABLE evidencia_audio ADD COLUMN evidencia_id_uuid UUID;
ALTER TABLE evidencia_mensagem ADD COLUMN evidencia_id_uuid UUID;
ALTER TABLE evidencia_movimentacao ADD COLUMN evidencia_id_uuid UUID;
ALTER TABLE evidencia_movimentacao ADD COLUMN movimentacao_id_uuid UUID;
ALTER TABLE evidencia_tarefa ADD COLUMN evidencia_id_uuid UUID;
ALTER TABLE evidencia_tarefa ADD COLUMN tarefa_id_uuid UUID;
ALTER TABLE evidencia_ticket ADD COLUMN evidencia_id_uuid UUID;
ALTER TABLE evidencia_ticket ADD COLUMN ticket_id_uuid UUID;

ALTER TABLE movimentacao_compra ADD COLUMN movimentacao_id_uuid UUID;
ALTER TABLE movimentacao_venda ADD COLUMN movimentacao_id_uuid UUID;
ALTER TABLE movimentacao_transferencia ADD COLUMN movimentacao_id_uuid UUID;
ALTER TABLE movimentacao_nascimento ADD COLUMN movimentacao_id_uuid UUID;
ALTER TABLE movimentacao_morte ADD COLUMN movimentacao_id_uuid UUID;

UPDATE usuario u
SET retiro_id_uuid = r.id_uuid
FROM retiro r
WHERE u.retiro_id = r.id;

UPDATE movimentacao m
SET retiro_id_uuid = r.id_uuid
FROM retiro r
WHERE m.retiro_id = r.id;

UPDATE tarefa t
SET retiro_id_uuid = r.id_uuid
FROM retiro r
WHERE t.retiro_id = r.id;

UPDATE ticket t
SET retiro_id_uuid = r.id_uuid
FROM retiro r
WHERE t.retiro_id = r.id;

UPDATE relatorio r
SET retiro_id_uuid = re.id_uuid
FROM retiro re
WHERE r.retiro_id = re.id;

UPDATE evidencia_foto ef
SET evidencia_id_uuid = e.id_uuid
FROM evidencia e
WHERE ef.evidencia_id = e.id;

UPDATE evidencia_audio ea
SET evidencia_id_uuid = e.id_uuid
FROM evidencia e
WHERE ea.evidencia_id = e.id;

UPDATE evidencia_mensagem em
SET evidencia_id_uuid = e.id_uuid
FROM evidencia e
WHERE em.evidencia_id = e.id;

UPDATE evidencia_movimentacao em
SET evidencia_id_uuid = e.id_uuid,
    movimentacao_id_uuid = m.id_uuid
FROM evidencia e, movimentacao m
WHERE em.evidencia_id = e.id
  AND em.movimentacao_id = m.id;

UPDATE evidencia_tarefa et
SET evidencia_id_uuid = e.id_uuid,
    tarefa_id_uuid = t.id_uuid
FROM evidencia e, tarefa t
WHERE et.evidencia_id = e.id
  AND et.tarefa_id = t.id;

UPDATE evidencia_ticket et
SET evidencia_id_uuid = e.id_uuid,
    ticket_id_uuid = t.id_uuid
FROM evidencia e, ticket t
WHERE et.evidencia_id = e.id
  AND et.ticket_id = t.id;

UPDATE movimentacao_compra mc
SET movimentacao_id_uuid = m.id_uuid
FROM movimentacao m
WHERE mc.movimentacao_id = m.id;

UPDATE movimentacao_venda mv
SET movimentacao_id_uuid = m.id_uuid
FROM movimentacao m
WHERE mv.movimentacao_id = m.id;

UPDATE movimentacao_transferencia mt
SET movimentacao_id_uuid = m.id_uuid
FROM movimentacao m
WHERE mt.movimentacao_id = m.id;

UPDATE movimentacao_nascimento mn
SET movimentacao_id_uuid = m.id_uuid
FROM movimentacao m
WHERE mn.movimentacao_id = m.id;

UPDATE movimentacao_morte mm
SET movimentacao_id_uuid = m.id_uuid
FROM movimentacao m
WHERE mm.movimentacao_id = m.id;

ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_retiro_id_foreign;
ALTER TABLE tarefa DROP CONSTRAINT IF EXISTS tarefa_retiro_id_foreign;
ALTER TABLE movimentacao DROP CONSTRAINT IF EXISTS movimentacao_retiro_id_foreign;
ALTER TABLE ticket DROP CONSTRAINT IF EXISTS ticket_retiro_id_foreign;
ALTER TABLE relatorio DROP CONSTRAINT IF EXISTS relatorio_retiro_id_fkey;

ALTER TABLE evidencia_foto DROP CONSTRAINT IF EXISTS evidencia_foto_evidencia_id_fkey;
ALTER TABLE evidencia_audio DROP CONSTRAINT IF EXISTS evidencia_audio_evidencia_id_fkey;
ALTER TABLE evidencia_mensagem DROP CONSTRAINT IF EXISTS evidencia_mensagem_evidencia_id_fkey;
ALTER TABLE evidencia_movimentacao DROP CONSTRAINT IF EXISTS evidencia_movimentacao_evidencia_id_fkey;
ALTER TABLE evidencia_movimentacao DROP CONSTRAINT IF EXISTS evidencia_movimentacao_movimentacao_id_fkey;
ALTER TABLE evidencia_tarefa DROP CONSTRAINT IF EXISTS evidencia_tarefa_evidencia_id_fkey;
ALTER TABLE evidencia_tarefa DROP CONSTRAINT IF EXISTS evidencia_tarefa_tarefa_id_fkey;
ALTER TABLE evidencia_ticket DROP CONSTRAINT IF EXISTS evidencia_ticket_evidencia_id_fkey;
ALTER TABLE evidencia_ticket DROP CONSTRAINT IF EXISTS evidencia_ticket_ticket_id_fkey;

ALTER TABLE movimentacao_compra DROP CONSTRAINT IF EXISTS movimentacao_compra_movimentacao_id_fkey;
ALTER TABLE movimentacao_venda DROP CONSTRAINT IF EXISTS movimentacao_venda_movimentacao_id_fkey;
ALTER TABLE movimentacao_transferencia DROP CONSTRAINT IF EXISTS movimentacao_transferencia_movimentacao_id_fkey;
ALTER TABLE movimentacao_nascimento DROP CONSTRAINT IF EXISTS movimentacao_nascimento_movimentacao_id_fkey;
ALTER TABLE movimentacao_morte DROP CONSTRAINT IF EXISTS movimentacao_morte_movimentacao_id_fkey;

ALTER TABLE evidencia_foto DROP CONSTRAINT evidencia_foto_pkey;
ALTER TABLE evidencia_audio DROP CONSTRAINT evidencia_audio_pkey;
ALTER TABLE evidencia_mensagem DROP CONSTRAINT evidencia_mensagem_pkey;
ALTER TABLE evidencia_movimentacao DROP CONSTRAINT evidencia_movimentacao_pkey;
ALTER TABLE evidencia_tarefa DROP CONSTRAINT evidencia_tarefa_pkey;
ALTER TABLE evidencia_ticket DROP CONSTRAINT evidencia_ticket_pkey;
ALTER TABLE movimentacao_compra DROP CONSTRAINT movimentacao_compra_pkey;
ALTER TABLE movimentacao_venda DROP CONSTRAINT movimentacao_venda_pkey;
ALTER TABLE movimentacao_transferencia DROP CONSTRAINT movimentacao_transferencia_pkey;
ALTER TABLE movimentacao_nascimento DROP CONSTRAINT movimentacao_nascimento_pkey;
ALTER TABLE movimentacao_morte DROP CONSTRAINT movimentacao_morte_pkey;
ALTER TABLE relatorio DROP CONSTRAINT relatorio_pkey;
ALTER TABLE evidencia DROP CONSTRAINT evidencia_pkey;
ALTER TABLE ticket DROP CONSTRAINT ticket_pkey;
ALTER TABLE tarefa DROP CONSTRAINT tarefa_pkey;
ALTER TABLE movimentacao DROP CONSTRAINT movimentacao_pkey;
ALTER TABLE retiro DROP CONSTRAINT retiro_pkey;

ALTER TABLE usuario DROP COLUMN retiro_id;
ALTER TABLE movimentacao DROP COLUMN retiro_id;
ALTER TABLE tarefa DROP COLUMN retiro_id;
ALTER TABLE ticket DROP COLUMN retiro_id;
ALTER TABLE relatorio DROP COLUMN retiro_id;

ALTER TABLE evidencia_foto DROP COLUMN evidencia_id;
ALTER TABLE evidencia_audio DROP COLUMN evidencia_id;
ALTER TABLE evidencia_mensagem DROP COLUMN evidencia_id;
ALTER TABLE evidencia_movimentacao DROP COLUMN evidencia_id, DROP COLUMN movimentacao_id;
ALTER TABLE evidencia_tarefa DROP COLUMN evidencia_id, DROP COLUMN tarefa_id;
ALTER TABLE evidencia_ticket DROP COLUMN evidencia_id, DROP COLUMN ticket_id;

ALTER TABLE movimentacao_compra DROP COLUMN movimentacao_id;
ALTER TABLE movimentacao_venda DROP COLUMN movimentacao_id;
ALTER TABLE movimentacao_transferencia DROP COLUMN movimentacao_id;
ALTER TABLE movimentacao_nascimento DROP COLUMN movimentacao_id;
ALTER TABLE movimentacao_morte DROP COLUMN movimentacao_id;

ALTER TABLE relatorio DROP COLUMN id;
ALTER TABLE evidencia DROP COLUMN id;
ALTER TABLE ticket DROP COLUMN id;
ALTER TABLE tarefa DROP COLUMN id;
ALTER TABLE movimentacao DROP COLUMN id;
ALTER TABLE retiro DROP COLUMN id;

ALTER TABLE retiro RENAME COLUMN id_uuid TO id;
ALTER TABLE movimentacao RENAME COLUMN id_uuid TO id;
ALTER TABLE tarefa RENAME COLUMN id_uuid TO id;
ALTER TABLE ticket RENAME COLUMN id_uuid TO id;
ALTER TABLE evidencia RENAME COLUMN id_uuid TO id;
ALTER TABLE relatorio RENAME COLUMN id_uuid TO id;

ALTER TABLE usuario RENAME COLUMN retiro_id_uuid TO retiro_id;
ALTER TABLE movimentacao RENAME COLUMN retiro_id_uuid TO retiro_id;
ALTER TABLE tarefa RENAME COLUMN retiro_id_uuid TO retiro_id;
ALTER TABLE ticket RENAME COLUMN retiro_id_uuid TO retiro_id;
ALTER TABLE relatorio RENAME COLUMN retiro_id_uuid TO retiro_id;

ALTER TABLE evidencia_foto RENAME COLUMN evidencia_id_uuid TO evidencia_id;
ALTER TABLE evidencia_audio RENAME COLUMN evidencia_id_uuid TO evidencia_id;
ALTER TABLE evidencia_mensagem RENAME COLUMN evidencia_id_uuid TO evidencia_id;
ALTER TABLE evidencia_movimentacao RENAME COLUMN evidencia_id_uuid TO evidencia_id;
ALTER TABLE evidencia_movimentacao RENAME COLUMN movimentacao_id_uuid TO movimentacao_id;
ALTER TABLE evidencia_tarefa RENAME COLUMN evidencia_id_uuid TO evidencia_id;
ALTER TABLE evidencia_tarefa RENAME COLUMN tarefa_id_uuid TO tarefa_id;
ALTER TABLE evidencia_ticket RENAME COLUMN evidencia_id_uuid TO evidencia_id;
ALTER TABLE evidencia_ticket RENAME COLUMN ticket_id_uuid TO ticket_id;

ALTER TABLE movimentacao_compra RENAME COLUMN movimentacao_id_uuid TO movimentacao_id;
ALTER TABLE movimentacao_venda RENAME COLUMN movimentacao_id_uuid TO movimentacao_id;
ALTER TABLE movimentacao_transferencia RENAME COLUMN movimentacao_id_uuid TO movimentacao_id;
ALTER TABLE movimentacao_nascimento RENAME COLUMN movimentacao_id_uuid TO movimentacao_id;
ALTER TABLE movimentacao_morte RENAME COLUMN movimentacao_id_uuid TO movimentacao_id;

ALTER TABLE usuario ALTER COLUMN retiro_id SET NOT NULL;
ALTER TABLE movimentacao ALTER COLUMN retiro_id SET NOT NULL;
ALTER TABLE tarefa ALTER COLUMN retiro_id SET NOT NULL;
ALTER TABLE ticket ALTER COLUMN retiro_id SET NOT NULL;
ALTER TABLE relatorio ALTER COLUMN retiro_id SET NOT NULL;

ALTER TABLE evidencia_foto ALTER COLUMN evidencia_id SET NOT NULL;
ALTER TABLE evidencia_audio ALTER COLUMN evidencia_id SET NOT NULL;
ALTER TABLE evidencia_mensagem ALTER COLUMN evidencia_id SET NOT NULL;
ALTER TABLE evidencia_movimentacao ALTER COLUMN evidencia_id SET NOT NULL;
ALTER TABLE evidencia_movimentacao ALTER COLUMN movimentacao_id SET NOT NULL;
ALTER TABLE evidencia_tarefa ALTER COLUMN evidencia_id SET NOT NULL;
ALTER TABLE evidencia_tarefa ALTER COLUMN tarefa_id SET NOT NULL;
ALTER TABLE evidencia_ticket ALTER COLUMN evidencia_id SET NOT NULL;
ALTER TABLE evidencia_ticket ALTER COLUMN ticket_id SET NOT NULL;
ALTER TABLE movimentacao_compra ALTER COLUMN movimentacao_id SET NOT NULL;
ALTER TABLE movimentacao_venda ALTER COLUMN movimentacao_id SET NOT NULL;
ALTER TABLE movimentacao_transferencia ALTER COLUMN movimentacao_id SET NOT NULL;
ALTER TABLE movimentacao_nascimento ALTER COLUMN movimentacao_id SET NOT NULL;
ALTER TABLE movimentacao_morte ALTER COLUMN movimentacao_id SET NOT NULL;

ALTER TABLE retiro ADD CONSTRAINT retiro_pkey PRIMARY KEY (id);
ALTER TABLE movimentacao ADD CONSTRAINT movimentacao_pkey PRIMARY KEY (id);
ALTER TABLE tarefa ADD CONSTRAINT tarefa_pkey PRIMARY KEY (id);
ALTER TABLE ticket ADD CONSTRAINT ticket_pkey PRIMARY KEY (id);
ALTER TABLE evidencia ADD CONSTRAINT evidencia_pkey PRIMARY KEY (id);
ALTER TABLE relatorio ADD CONSTRAINT relatorio_pkey PRIMARY KEY (id);
ALTER TABLE evidencia_foto ADD CONSTRAINT evidencia_foto_pkey PRIMARY KEY (evidencia_id);
ALTER TABLE evidencia_audio ADD CONSTRAINT evidencia_audio_pkey PRIMARY KEY (evidencia_id);
ALTER TABLE evidencia_mensagem ADD CONSTRAINT evidencia_mensagem_pkey PRIMARY KEY (evidencia_id);
ALTER TABLE evidencia_movimentacao ADD CONSTRAINT evidencia_movimentacao_pkey PRIMARY KEY (evidencia_id, movimentacao_id);
ALTER TABLE evidencia_tarefa ADD CONSTRAINT evidencia_tarefa_pkey PRIMARY KEY (evidencia_id, tarefa_id);
ALTER TABLE evidencia_ticket ADD CONSTRAINT evidencia_ticket_pkey PRIMARY KEY (evidencia_id, ticket_id);
ALTER TABLE movimentacao_compra ADD CONSTRAINT movimentacao_compra_pkey PRIMARY KEY (movimentacao_id);
ALTER TABLE movimentacao_venda ADD CONSTRAINT movimentacao_venda_pkey PRIMARY KEY (movimentacao_id);
ALTER TABLE movimentacao_transferencia ADD CONSTRAINT movimentacao_transferencia_pkey PRIMARY KEY (movimentacao_id);
ALTER TABLE movimentacao_nascimento ADD CONSTRAINT movimentacao_nascimento_pkey PRIMARY KEY (movimentacao_id);
ALTER TABLE movimentacao_morte ADD CONSTRAINT movimentacao_morte_pkey PRIMARY KEY (movimentacao_id);

ALTER TABLE usuario ADD CONSTRAINT usuario_retiro_id_foreign FOREIGN KEY (retiro_id) REFERENCES retiro(id);
ALTER TABLE tarefa ADD CONSTRAINT tarefa_retiro_id_foreign FOREIGN KEY (retiro_id) REFERENCES retiro(id);
ALTER TABLE movimentacao ADD CONSTRAINT movimentacao_retiro_id_foreign FOREIGN KEY (retiro_id) REFERENCES retiro(id);
ALTER TABLE ticket ADD CONSTRAINT ticket_retiro_id_foreign FOREIGN KEY (retiro_id) REFERENCES retiro(id);
ALTER TABLE relatorio ADD CONSTRAINT relatorio_retiro_id_foreign FOREIGN KEY (retiro_id) REFERENCES retiro(id);

ALTER TABLE evidencia_foto ADD CONSTRAINT evidencia_foto_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia(id) ON DELETE CASCADE;
ALTER TABLE evidencia_audio ADD CONSTRAINT evidencia_audio_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia(id) ON DELETE CASCADE;
ALTER TABLE evidencia_mensagem ADD CONSTRAINT evidencia_mensagem_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia(id) ON DELETE CASCADE;
ALTER TABLE evidencia_movimentacao ADD CONSTRAINT evidencia_movimentacao_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia(id) ON DELETE CASCADE;
ALTER TABLE evidencia_movimentacao ADD CONSTRAINT evidencia_movimentacao_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id) ON DELETE CASCADE;
ALTER TABLE evidencia_tarefa ADD CONSTRAINT evidencia_tarefa_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia(id) ON DELETE CASCADE;
ALTER TABLE evidencia_tarefa ADD CONSTRAINT evidencia_tarefa_tarefa_id_foreign FOREIGN KEY (tarefa_id) REFERENCES tarefa(id) ON DELETE CASCADE;
ALTER TABLE evidencia_ticket ADD CONSTRAINT evidencia_ticket_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia(id) ON DELETE CASCADE;
ALTER TABLE evidencia_ticket ADD CONSTRAINT evidencia_ticket_ticket_id_foreign FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE;

ALTER TABLE movimentacao_compra ADD CONSTRAINT movimentacao_compra_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id);
ALTER TABLE movimentacao_venda ADD CONSTRAINT movimentacao_venda_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id);
ALTER TABLE movimentacao_transferencia ADD CONSTRAINT movimentacao_transferencia_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id);
ALTER TABLE movimentacao_nascimento ADD CONSTRAINT movimentacao_nascimento_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id);
ALTER TABLE movimentacao_morte ADD CONSTRAINT movimentacao_morte_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao(id);

DROP SEQUENCE IF EXISTS retiro_id_seq;
DROP SEQUENCE IF EXISTS movimentacao_id_seq;
DROP SEQUENCE IF EXISTS tarefa_id_seq;
DROP SEQUENCE IF EXISTS ticket_id_seq;
DROP SEQUENCE IF EXISTS evidencia_id_seq;
DROP SEQUENCE IF EXISTS relatorio_id_seq;
