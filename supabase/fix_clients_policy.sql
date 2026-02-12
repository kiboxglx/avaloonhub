-- 1. Liberar acesso público para CLIENTS (Fix RLS Error)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Removemos políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Allow public read clients" ON "public"."clients";
DROP POLICY IF EXISTS "Allow public insert clients" ON "public"."clients";
DROP POLICY IF EXISTS "Allow public update clients" ON "public"."clients";

-- Criamos políticas permissivas (CRUD completo para desenvolvimento)
CREATE POLICY "Allow public read clients" ON "public"."clients" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert clients" ON "public"."clients" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON "public"."clients" FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow public delete clients" ON "public"."clients" FOR DELETE TO anon, authenticated USING (true);
