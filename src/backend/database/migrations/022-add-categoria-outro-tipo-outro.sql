-- 022: campo de texto livre para quando a categoria/tipo for "outro/outros".
-- Mantém o enum (ticket.categoria / movimentacao.tipo) com o valor 'outro'/'outros'
-- e guarda aqui o nome digitado pelo capataz.
ALTER TABLE ticket ADD COLUMN IF NOT EXISTS categoria_outro TEXT;
ALTER TABLE movimentacao ADD COLUMN IF NOT EXISTS tipo_outro TEXT;
