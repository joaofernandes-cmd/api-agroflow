-- 026: roster OFICIAL da fazenda (planilha Plan_Inteli_ProjetoBRPEC).
-- Saímos da fase de demo: cada retiro real e o seu capataz responsável passam a
-- existir no banco, com nomes e vínculos consistentes. A tela de Delegar lê
-- daqui (campo combinado "Retiro — Capataz") e a tarefa nasce no retiro do
-- capataz escolhido.
--
-- Mantém o que já funcionava: os logins de demonstração (capataz@/supervisor@/
-- gerente@agroflow.com) e os dados operacionais semeados (migração 025) seguem
-- intactos. "Aroeira" reaproveita o retiro de demo (id ...8000-000000000001),
-- evitando retiro duplicado; o capataz de demo (Capataz Daniel) continua nele.
--
-- Modelo flexível de supervisão: um supervisor pode cobrir 1 OU vários retiros.
-- Por isso a associação supervisor↔retiro fica numa tabela própria
-- (supervisor_retiro), em vez de presa ao único usuario.retiro_id.
--
-- Idempotente: ids fixos + ON CONFLICT DO NOTHING.

-- ── RETIROS ──────────────────────────────────────────────────────────────────
-- Aroeira já existe (retiro de demo). Os demais entram com ids fixos.
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

-- ── CAPATAZES RESPONSÁVEIS ───────────────────────────────────────────────────
-- Um capataz por retiro (nome conforme a planilha). Capatazes acessam o app por
-- link/token; ainda assim recebem login/senha (mesmo hash de demo) para o cadastro
-- ficar uniforme e poderem entrar se necessário. Login = <retiro>@agroflow.com.
INSERT INTO usuario (id, retiro_id, nome, login, senha_hash, status, cargo) VALUES
  ('00000000-0000-4000-8011-000000000001', '00000000-0000-4000-8010-000000000001', 'Rogério',     'acurizal@agroflow.com',    '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000002', '00000000-0000-4000-8000-000000000001', 'Lucas',       'aroeira@agroflow.com',     '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000003', '00000000-0000-4000-8010-000000000002', 'Marcelo',     'baia-bonita@agroflow.com', '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000004', '00000000-0000-4000-8010-000000000003', 'Fabiano',     'bodoquena-1@agroflow.com', '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000005', '00000000-0000-4000-8010-000000000004', 'Valdineis',   'bodoquena-2@agroflow.com', '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000006', '00000000-0000-4000-8010-000000000005', 'Daniel',      'boqueirao@agroflow.com',   '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000007', '00000000-0000-4000-8010-000000000006', 'João Paulo',  'caieira@agroflow.com',     '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000008', '00000000-0000-4000-8010-000000000007', 'Alberto',     'cmb@agroflow.com',         '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000009', '00000000-0000-4000-8010-000000000008', 'Valdineis',   'confinamento@agroflow.com','$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000010', '00000000-0000-4000-8010-000000000009', 'José Carlos', 'cristo@agroflow.com',      '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000011', '00000000-0000-4000-8010-000000000010', 'Valdeci',     'morada-nova@agroflow.com', '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000012', '00000000-0000-4000-8010-000000000011', 'Daniel',      'morro-azul@agroflow.com',  '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000013', '00000000-0000-4000-8010-000000000012', 'Manoel',      'puga@agroflow.com',        '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000014', '00000000-0000-4000-8010-000000000013', 'Wilson',      'sao-miguel@agroflow.com',  '$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz'),
  ('00000000-0000-4000-8011-000000000015', '00000000-0000-4000-8010-000000000014', 'Ariovaldo',   'vista-alegre@agroflow.com','$2b$12$yDRH6oMkyBXnSwZonFKiFe24nJaEnRL.nEzOUJgDYEG1PtofMeRLW', 'ativo', 'capataz')
ON CONFLICT (login) DO NOTHING;

-- ── SUPERVISÃO (supervisor ↔ retiros) ────────────────────────────────────────
-- Um supervisor pode cobrir 1 ou vários retiros. usuario.retiro_id continua
-- sendo o retiro "sede" do supervisor; os retiros adicionais ficam aqui.
CREATE TABLE IF NOT EXISTS supervisor_retiro (
  supervisor_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  retiro_id     UUID NOT NULL REFERENCES retiro(id)  ON DELETE CASCADE,
  PRIMARY KEY (supervisor_id, retiro_id)
);

-- Supervisor de demonstração cobre toda a fazenda (os 15 retiros do roster),
-- para o Delegar já mostrar todos os pares Retiro—Capataz.
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
