INSERT INTO retiro (id, nome)
VALUES
  (1, 'Aroeira')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuario (id, retiro_id, nome, login, senha_hash, status, cargo)
VALUES ('11111111-1111-1111-1111-111111111111', 1, 'Capataz Daniel', 'capataz@agroflow.com', 'joaoglauco1', 'ativo', 'capataz')
ON CONFLICT (login) DO NOTHING;

INSERT INTO usuario (retiro_id, nome, login, senha_hash, status, cargo)
VALUES (1, 'Supervisor Luiz', 'supervisor@agroflow.com', 'joaoglauco1', 'ativo', 'supervisor')
ON CONFLICT (login) DO NOTHING;

INSERT INTO usuario (retiro_id, nome, login, senha_hash, status, cargo)
VALUES (1, 'Gerente Marcos', 'gerente@agroflow.com', 'joaoglauco1', 'ativo', 'gerente')
ON CONFLICT (login) DO NOTHING;
