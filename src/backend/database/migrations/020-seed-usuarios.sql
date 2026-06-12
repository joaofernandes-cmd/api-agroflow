INSERT INTO retiro (id, nome)
VALUES
  (1, 'Aroeira')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuario (retiro_id, nome, login, senha_hash, status, cargo)
VALUES
  (1, 'Supervisor Luiz', 'supervisor@agroflow.com', 'joaoglauco1', 'ativo', 'supervisor'),
  (1, 'Gerente Marcos', 'gerente@agroflow.com', 'joaoglauco1', 'ativo', 'gerente');