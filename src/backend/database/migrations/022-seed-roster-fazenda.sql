-- 022 - Roster oficial da fazenda.
-- Cria os retiros reais, os capatazes responsáveis e os vínculos entre supervisor e retiros.
-- Os registros usam ids fixos e ON CONFLICT para manter a migration idempotente.

-- Retiros
INSERT INTO retiro (id, nome) VALUES
  ('00000000-0000-4000-8010-000000000001', 'Acurizal'),
  ('00000000-0000-4000-8010-000000000002', 'Baia Bonita'),
  ('00000000-0000-4000-8010-000000000003', 'Bodoquena 1'),
  ('00000000-0000-4000-8010-000000000004', 'Bodoquena 2'),
  ('00000000-0000-4000-8010-000000000005', 'Boqueirão'),
  ('00000000-0000-4000-8010-000000000006', 'Caieira'),
  ('00000000-0000-4000-8010-000000000007', 'CMB'),
  ('00000000-0000-4000-8010-000000000008', 'Confinamento'),
  ('00000000-0000-4000-8010-000000000009', 'Cristo'),
  ('00000000-0000-4000-8010-000000000010', 'Morada Nova'),
  ('00000000-0000-4000-8010-000000000011', 'Morro Azul'),
  ('00000000-0000-4000-8010-000000000012', 'Puga'),
  ('00000000-0000-4000-8010-000000000013', 'São Miguel'),
  ('00000000-0000-4000-8010-000000000014', 'Vista Alegre')
ON CONFLICT (id) DO NOTHING;

-- Capatazes responsáveis
-- Capatazes acessam por link/token, por isso não recebem login/senha.
INSERT INTO usuario (id, retiro_id, nome, identificador, login, senha_hash, status, cargo) VALUES
  ('00000000-0000-4000-8011-000000000001', '00000000-0000-4000-8010-000000000001', 'Rogério',     'capataz-acurizal',     NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000002', '00000000-0000-4000-8000-000000000001', 'Lucas',       'capataz-aroeira',      NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000003', '00000000-0000-4000-8010-000000000002', 'Marcelo',     'capataz-baia-bonita',  NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000004', '00000000-0000-4000-8010-000000000003', 'Fabiano',     'capataz-bodoquena-1',  NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000005', '00000000-0000-4000-8010-000000000004', 'Valdineis',   'capataz-bodoquena-2',  NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000006', '00000000-0000-4000-8010-000000000005', 'Daniel',      'capataz-boqueirao',    NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000007', '00000000-0000-4000-8010-000000000006', 'João Paulo',  'capataz-caieira',      NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000008', '00000000-0000-4000-8010-000000000007', 'Alberto',     'capataz-cmb',          NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000009', '00000000-0000-4000-8010-000000000008', 'Valdineis',   'capataz-confinamento', NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000010', '00000000-0000-4000-8010-000000000009', 'José Carlos', 'capataz-cristo',       NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000011', '00000000-0000-4000-8010-000000000010', 'Valdeci',     'capataz-morada-nova',  NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000012', '00000000-0000-4000-8010-000000000011', 'Daniel',      'capataz-morro-azul',   NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000013', '00000000-0000-4000-8010-000000000012', 'Manoel',      'capataz-puga',         NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000014', '00000000-0000-4000-8010-000000000013', 'Wilson',      'capataz-sao-miguel',   NULL, NULL, 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000015', '00000000-0000-4000-8010-000000000014', 'Ariovaldo',   'capataz-vista-alegre', NULL, NULL, 'ativo', 'capataz')
ON CONFLICT (id) DO NOTHING;

-- Supervisão
-- Um supervisor pode cobrir um ou vários retiros.
CREATE TABLE IF NOT EXISTS supervisor_retiro (
  supervisor_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  retiro_id     UUID NOT NULL REFERENCES retiro(id)  ON DELETE CASCADE,
  PRIMARY KEY (supervisor_id, retiro_id)
);

INSERT INTO supervisor_retiro (supervisor_id, retiro_id)
SELECT sup.id, r.id
FROM (SELECT id FROM usuario WHERE login = 'supervisor@agroflow.com') sup
CROSS JOIN (
  VALUES
    ('00000000-0000-4000-8000-000000000001'::uuid),
    ('00000000-0000-4000-8010-000000000001'::uuid),
    ('00000000-0000-4000-8010-000000000002'::uuid),
    ('00000000-0000-4000-8010-000000000003'::uuid),
    ('00000000-0000-4000-8010-000000000004'::uuid),
    ('00000000-0000-4000-8010-000000000005'::uuid),
    ('00000000-0000-4000-8010-000000000006'::uuid),
    ('00000000-0000-4000-8010-000000000007'::uuid),
    ('00000000-0000-4000-8010-000000000008'::uuid),
    ('00000000-0000-4000-8010-000000000009'::uuid),
    ('00000000-0000-4000-8010-000000000010'::uuid),
    ('00000000-0000-4000-8010-000000000011'::uuid),
    ('00000000-0000-4000-8010-000000000012'::uuid),
    ('00000000-0000-4000-8010-000000000013'::uuid),
    ('00000000-0000-4000-8010-000000000014'::uuid)
) AS r(id)
ON CONFLICT DO NOTHING;
