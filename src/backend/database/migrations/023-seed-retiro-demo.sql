-- 023: garante o retiro de demonstração com o id fixo usado pelo app/fixtures
-- (00000000-0000-4000-8000-000000000001) e aponta os usuários seedados para ele.
-- Sem isso, salvar movimentação/ticket deslogado (capataz demo) viola a FK de retiro.
INSERT INTO retiro (id, nome)
VALUES ('00000000-0000-4000-8000-000000000001', 'Aroeira')
ON CONFLICT (id) DO NOTHING;

UPDATE usuario
SET retiro_id = '00000000-0000-4000-8000-000000000001'
WHERE login IN ('capataz@agroflow.com', 'supervisor@agroflow.com', 'gerente@agroflow.com');
