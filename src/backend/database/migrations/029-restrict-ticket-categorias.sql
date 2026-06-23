UPDATE ticket
SET categoria = 'hidraulica',
    categoria_outro = NULL
WHERE categoria IN ('abastecimento_agua', 'edificacao', 'outro');

ALTER TABLE ticket
  DROP CONSTRAINT IF EXISTS ticket_categoria_restrita_check;

ALTER TABLE ticket
  ADD CONSTRAINT ticket_categoria_restrita_check
  CHECK (categoria IN ('cerca', 'eletrica', 'hidraulica'));
