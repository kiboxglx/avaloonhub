-- Adiciona coluna de responsável na tabela clients
-- Referencia um membro da equipe (account manager)
ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Índice para buscas rápidas por responsável
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);
