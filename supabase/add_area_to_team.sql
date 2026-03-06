-- Adicionar campos ao team_members para suportar área, email e telefone
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'GENERIC';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS phone TEXT;
