-- 025: dados de DEMONSTRAÇÃO operacionais (tickets, tarefas e movimentações) no
-- retiro demo (00000000-0000-4000-8000-000000000001), para as telas já abrirem
-- populadas e o fluxo capataz → supervisor → relatório/gerente ser visível sem
-- precisar cadastrar tudo na mão. Tudo amarrado aos usuários reais semeados:
--   capataz@agroflow.com  (abre tickets / registra movimentações / faz tarefas)
--   supervisor@agroflow.com (aprova tickets/tarefas, valida movimentações)
-- Idempotente: ids fixos + ON CONFLICT DO NOTHING (a migração roda uma vez, mas
-- isto a torna segura mesmo se reaplicada).

-- ── TICKETS ────────────────────────────────────────────────────────────────
-- 2 pendentes (aguardando o supervisor) + 1 já aprovado (aparece em "Validados"
-- e no relatório).
INSERT INTO ticket (id, retiro_id, aberto_por, categoria, localizacao, status, descricao, prioridade, sincronizado)
SELECT '00000000-0000-4000-8003-000000000001', '00000000-0000-4000-8000-000000000001', cap.id,
       'cerca', 'Pasto leste', 'pendente',
       'Cerca rompida em cerca de 15 metros; risco de fuga do gado.', 'alta', true
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap
ON CONFLICT (id) DO NOTHING;

INSERT INTO ticket (id, retiro_id, aberto_por, categoria, localizacao, status, descricao, prioridade, sincronizado)
SELECT '00000000-0000-4000-8003-000000000002', '00000000-0000-4000-8000-000000000001', cap.id,
       'hidraulica', 'Galpão central', 'pendente',
       'Vazamento no ponto de água; manutenção urgente.', 'media', true
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap
ON CONFLICT (id) DO NOTHING;

INSERT INTO ticket (id, retiro_id, aberto_por, aprovado_por, categoria, localizacao, status, descricao, prioridade, sincronizado)
SELECT '00000000-0000-4000-8003-000000000003', '00000000-0000-4000-8000-000000000001', cap.id, sup.id,
       'eletrica', 'Casa de bombas', 'aprovado',
       'Bomba d''água sem energia; bebedouros sem reposição.', 'alta', true
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap,
     (SELECT id FROM usuario WHERE login = 'supervisor@agroflow.com') sup
ON CONFLICT (id) DO NOTHING;

-- ── TAREFAS ──────────────────────────────────────────────────────────────
-- O título da atividade fica em `categoria` (o delegar grava assim); `descricao`
-- guarda os detalhes. 1 pendente (delegada), 1 concluída (capataz fez, aguarda
-- validação) e 1 aprovada (validada — vai pro relatório).
INSERT INTO tarefa (id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, status, sincronizado)
SELECT '00000000-0000-4000-8004-000000000001', '00000000-0000-4000-8000-000000000001', sup.id, cap.id,
       'Percorrer as cercas do retiro e registrar trechos danificados.', 'Inspeção das cercas', 'alta', 'pendente', true
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap,
     (SELECT id FROM usuario WHERE login = 'supervisor@agroflow.com') sup
ON CONFLICT (id) DO NOTHING;

INSERT INTO tarefa (id, retiro_id, criada_por, atribuida_a, descricao, categoria, prioridade, status, sincronizado)
SELECT '00000000-0000-4000-8004-000000000002', '00000000-0000-4000-8000-000000000001', sup.id, cap.id,
       'Conferir a quantidade de cabeças e comparar com o registro.', 'Conferência do rebanho', 'media', 'concluido', true
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap,
     (SELECT id FROM usuario WHERE login = 'supervisor@agroflow.com') sup
ON CONFLICT (id) DO NOTHING;

INSERT INTO tarefa (id, retiro_id, criada_por, atribuida_a, aprovado_por, descricao, categoria, prioridade, status, sincronizado)
SELECT '00000000-0000-4000-8004-000000000003', '00000000-0000-4000-8000-000000000001', sup.id, cap.id, sup.id,
       'Contar todas as cabeças do retiro e anotar o total.', 'Contagem geral', 'baixa', 'aprovado', true
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap,
     (SELECT id FROM usuario WHERE login = 'supervisor@agroflow.com') sup
ON CONFLICT (id) DO NOTHING;

-- ── MOVIMENTAÇÕES ──────────────────────────────────────────────────────────
-- 1 nascimento pendente + 1 transferência já validada (vai pro relatório).
INSERT INTO movimentacao (id, retiro_id, capataz_id, tipo, status, sincronizado, estagio_vida)
SELECT '00000000-0000-4000-8005-000000000001', '00000000-0000-4000-8000-000000000001', cap.id,
       'nascimento', 'pendente', true, 'BEZERRO 0 A 7 MESES'
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap
ON CONFLICT (id) DO NOTHING;

INSERT INTO movimentacao_nascimento (movimentacao_id, origem, quantidade)
VALUES ('00000000-0000-4000-8005-000000000001', 'Aroeira', 3)
ON CONFLICT (movimentacao_id) DO NOTHING;

INSERT INTO movimentacao (id, retiro_id, capataz_id, validado_por, tipo, status, sincronizado, estagio_vida, data_validacao)
SELECT '00000000-0000-4000-8005-000000000002', '00000000-0000-4000-8000-000000000001', cap.id, sup.id,
       'transferencia', 'validado', true, 'BOI 25 A 36 MESES', NOW()
FROM (SELECT id FROM usuario WHERE login = 'capataz@agroflow.com') cap,
     (SELECT id FROM usuario WHERE login = 'supervisor@agroflow.com') sup
ON CONFLICT (id) DO NOTHING;

INSERT INTO movimentacao_transferencia (movimentacao_id, origem, destino, quantidade)
VALUES ('00000000-0000-4000-8005-000000000002', 'Puga', 'CMB', 40)
ON CONFLICT (movimentacao_id) DO NOTHING;
