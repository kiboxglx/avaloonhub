-- Migração para Otimização de Performance e Edição
-- Adiciona índice para buscas rápidas por data de agendamento
CREATE INDEX IF NOT EXISTS idx_demands_scheduled_at ON demands (scheduled_at);

-- Garante que a coluna de data de criação também tenha índice (para logs e histórico)
CREATE INDEX IF NOT EXISTS idx_demands_created_at ON demands (created_at);
