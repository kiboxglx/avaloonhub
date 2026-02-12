
-- 1. Add 'type' column to demands if not exists (to distinguish Shoots, Content, etc)
ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS type text DEFAULT 'GENERIC'; -- 'SHOOT', 'CONTENT', 'MEETING', 'GENERIC'

-- 2. Create team_members table (independent of auth.users for flexible directory)
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  role text,
  location text,
  status text DEFAULT 'Available', -- 'On-Set', 'Available', 'Offline'
  avatar_url text,
  specialties text[], -- Array of strings
  kit jsonb DEFAULT '[]'::jsonb -- Array of {icon: string, name: string}
);

-- 3. Enable Public Access for Team Members (Dev Mode)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read team" ON "public"."team_members";
DROP POLICY IF EXISTS "Allow public insert team" ON "public"."team_members";
DROP POLICY IF EXISTS "Allow public update team" ON "public"."team_members";

CREATE POLICY "Allow public read team" ON "public"."team_members" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert team" ON "public"."team_members" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update team" ON "public"."team_members" FOR UPDATE TO anon, authenticated USING (true);

-- 4. Ensure Demands policies allow the new column updates (already permissive but good to verify)
-- Rerunning permissive policies just in case
DROP POLICY IF EXISTS "Allow public read demands" ON "public"."demands";
DROP POLICY IF EXISTS "Allow public insert demands" ON "public"."demands";
DROP POLICY IF EXISTS "Allow public update demands" ON "public"."demands";

CREATE POLICY "Allow public read demands" ON "public"."demands" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert demands" ON "public"."demands" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update demands" ON "public"."demands" FOR UPDATE TO anon, authenticated USING (true);
