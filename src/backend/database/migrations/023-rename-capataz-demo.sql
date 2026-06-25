-- 023 - Renomeia o capataz de demonstração (acesso por QR Code) de "Daniel" para "Lucas".
-- O usuário 'capataz-capataz' está vinculado ao retiro Aroeira, cujo capataz é o Lucas,
-- alinhando a tela de entrada com a home e demais telas do capataz.
-- Idempotente: só atualiza enquanto o nome antigo ainda existir.

UPDATE usuario
SET nome = 'Capataz Lucas'
WHERE identificador = 'capataz-capataz'
  AND nome = 'Capataz Daniel';
