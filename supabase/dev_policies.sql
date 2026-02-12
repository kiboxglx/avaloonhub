
-- ⚠️ ATENÇÃO: ESTE SCRIPT LIBERA ACESSO PÚBLICO (SEM LOGIN) AOS DADOS.
-- USE APENAS EM DESENVOLVIMENTO PARA TESTAR O FRONTEND SEM LOGIN IMPLEMENTADO.

-- Habilitar leitura pública para tabela CLIENTS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."clients";
CREATE POLICY "Allow public read access clients" ON "public"."clients" FOR SELECT TO anon, authenticated USING (true);

-- Habilitar leitura pública para tabela SERVICES
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."services";
CREATE POLICY "Allow public read access services" ON "public"."services" FOR SELECT TO anon, authenticated USING (true);

-- Habilitar CRUD público para tabela DEMANDS
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."demands";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."demands";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "public"."demands";

CREATE POLICY "Allow public read demands" ON "public"."demands" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert demands" ON "public"."demands" FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update demands" ON "public"."demands" FOR UPDATE TO anon, authenticated USING (true);
