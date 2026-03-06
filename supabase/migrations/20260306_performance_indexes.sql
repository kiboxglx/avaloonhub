-- ========================================================================
-- Avaloon Hub: Database Performance Indexes
-- Run this in the Supabase SQL Editor (SQL > New Query)
-- ========================================================================

-- ─── demands table ─────────────────────────────────────────────────────────
-- Most queried columns: assigned_to, scheduled_at, status, area

-- Single column indexes for common filters
CREATE INDEX IF NOT EXISTS idx_demands_assigned_to   ON demands(assigned_to);
CREATE INDEX IF NOT EXISTS idx_demands_status        ON demands(status);
CREATE INDEX IF NOT EXISTS idx_demands_area          ON demands(area);
CREATE INDEX IF NOT EXISTS idx_demands_created_at    ON demands(created_at DESC);

-- Optimised index for the conflict check query (checkConflict function)
-- Covers: WHERE assigned_to = X AND scheduled_at BETWEEN A AND B
CREATE INDEX IF NOT EXISTS idx_demands_conflict_check
    ON demands(assigned_to, scheduled_at DESC)
    WHERE scheduled_at IS NOT NULL;

-- JSONB indexes for frequent briefing_data lookups (creator notifications)
CREATE INDEX IF NOT EXISTS idx_demands_created_by
    ON demands((briefing_data->>'created_by'));

CREATE INDEX IF NOT EXISTS idx_demands_creator_notified
    ON demands((briefing_data->>'creator_notified'));

-- ─── clients table ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_account_manager_id ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_status             ON clients(status);

-- ─── team_members table ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_team_members_email       ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_system_role ON team_members(system_role);
CREATE INDEX IF NOT EXISTS idx_team_members_status      ON team_members(status);

-- ========================================================================
-- To verify indexes were created, run:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
-- ========================================================================
