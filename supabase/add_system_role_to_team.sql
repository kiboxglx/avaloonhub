-- Adiciona system_role aos membros da equipe para controle de acesso real
ALTER TABLE team_members
    ADD COLUMN IF NOT EXISTS system_role TEXT DEFAULT 'viewer'
    CHECK (system_role IN ('admin', 'account_manager', 'videomaker', 'designer', 'traffic', 'viewer'));

-- Sugestão de migração inicial: mapear area → system_role
-- Execute manualmente conforme sua realidade:
-- UPDATE team_members SET system_role = 'account_manager' WHERE area = 'ACCOUNTS';
-- UPDATE team_members SET system_role = 'videomaker'      WHERE area = 'VIDEOMAKER';
-- UPDATE team_members SET system_role = 'designer'        WHERE area = 'DESIGN';
-- UPDATE team_members SET system_role = 'traffic'         WHERE area = 'TRAFFIC';
-- UPDATE team_members SET system_role = 'admin'           WHERE <seu usuario admin>;
