-- Adiciona responsável (assigned_to) em demands
ALTER TABLE demands
    ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Índice para filtros rápidos por responsável
CREATE INDEX IF NOT EXISTS idx_demands_assigned_to ON demands(assigned_to);
