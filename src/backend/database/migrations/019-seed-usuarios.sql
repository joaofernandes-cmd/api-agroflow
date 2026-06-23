INSERT INTO retiro (id, nome)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'Aroeira')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuario (id, retiro_id, nome, identificador, login, senha_hash, status, cargo)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-4000-8000-000000000001', 'Capataz Daniel', 'capataz-capataz', NULL, NULL, 'ativo', 'capataz')
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuario (retiro_id, nome, identificador, login, senha_hash, status, cargo)
VALUES ('00000000-0000-4000-8000-000000000001', 'Supervisor Luiz', 'supervisor-supervisor', 'supervisor@agroflow.com', '$2b$12$D4FBjZKwiireuTs93MZdhukjGXla.V69f9JJvf1AM/neOYzy9lcji', 'ativo', 'supervisor')
ON CONFLICT (login) DO NOTHING;

INSERT INTO usuario (retiro_id, nome, identificador, login, senha_hash, status, cargo)
VALUES ('00000000-0000-4000-8000-000000000001', 'Gerente Marcos', 'gerente-gerente', 'gerente@agroflow.com', '$2b$12$zvc7io2MyDOpoeHQt0uXKOKlPB0K04gOf7t4.9nNn680u2d8Q5MVq', 'ativo', 'gerente')
ON CONFLICT (login) DO NOTHING;
