
-- 1. Adicionar coluna 'type' em demandas de forma segura
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demands' AND column_name = 'type') THEN
        ALTER TABLE public.demands ADD COLUMN type text DEFAULT 'GENERIC';
    END IF;
END $$;

-- 2. Criar tabela de equipe (team_members)
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  role text,
  location text,
  status text DEFAULT 'Available',
  avatar_url text,
  specialties text[], 
  kit jsonb DEFAULT '[]'::jsonb 
);

-- 3. Liberar acesso público para TEAM_MEMBERS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Removemos as políticas antigas antes de criar para evitar o erro "policy already exists"
DROP POLICY IF EXISTS "Allow public read team" ON "public"."team_members";
DROP POLICY IF EXISTS "Allow public insert team" ON "public"."team_members";
DROP POLICY IF EXISTS "Allow public update team" ON "public"."team_members";

CREATE POLICY "Allow public read team" ON "public"."team_members" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert team" ON "public"."team_members" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update team" ON "public"."team_members" FOR UPDATE TO anon, authenticated USING (true);

-- 4. Garantir permissões em DEMANDS (Removemos antes para corrigir o erro que você teve)
DROP POLICY IF EXISTS "Allow public read demands" ON "public"."demands";
DROP POLICY IF EXISTS "Allow public insert demands" ON "public"."demands";
DROP POLICY IF EXISTS "Allow public update demands" ON "public"."demands";

CREATE POLICY "Allow public read demands" ON "public"."demands" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert demands" ON "public"."demands" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update demands" ON "public"."demands" FOR UPDATE TO anon, authenticated USING (true);
