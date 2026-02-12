-- Seed Data for Avaloon Hub

-- 1. Clients
INSERT INTO public.clients (name, sector, tier, monthly_value, status, logo_url, drive_link)
VALUES
('Alpha Business Corp', 'Marketing Digital', 'Tier 1', 15000.00, 'Active', 'https://ui-avatars.com/api/?name=Alpha+Business&background=0D8ABC&color=fff', 'https://drive.google.com/drive/folders/mock-alpha'),
('Beta Solutions', 'Tecnologia', 'Tier 2', 8500.00, 'Active', 'https://ui-avatars.com/api/?name=Beta+Solutions&background=6B21A8&color=fff', ''),
('Gamma Retail', 'Varejo', 'Tier 3', 22000.00, 'Pending', 'https://ui-avatars.com/api/?name=Gamma+Retail&background=F59E0B&color=fff', ''),
('Delta Construct', 'Imobiliário', 'Tier 2', 12000.00, 'Active', 'https://ui-avatars.com/api/?name=Delta+Construct&background=10B981&color=fff', '');

-- 2. Services
INSERT INTO public.services (name, description, base_price)
VALUES
('Video Institucional', 'Vídeo completo com roteiro, captação e edição', 3500.00),
('Cobertura de Evento', 'Videomaker para cobertura de evento (4h)', 1200.00),
('Reels / TikTok Pack', 'Pacote de 5 vídeos curtos editados', 800.00),
('Drone Footage', 'Captação aérea com drone', 1500.00);

-- 3. Demands (Linked usually by ID, but using subqueries for seed simplicity if IDs are UUIDs. 
-- Since we generated UUIDs, we can't know them easily here beforehand without doing PL/SQL blocks or just inserting mock UUIDs.
-- For simplicity in a raw SQL seed that might be run in Supabase SQL editor, let's just insert some independent records or use a DO block.)

DO $$
DECLARE
  alpha_id uuid;
  beta_id uuid;
  video_service_id uuid;
  reels_service_id uuid;
BEGIN
  SELECT id INTO alpha_id FROM public.clients WHERE name = 'Alpha Business Corp' LIMIT 1;
  SELECT id INTO beta_id FROM public.clients WHERE name = 'Beta Solutions' LIMIT 1;
  SELECT id INTO video_service_id FROM public.services WHERE name = 'Video Institucional' LIMIT 1;
  SELECT id INTO reels_service_id FROM public.services WHERE name = 'Reels / TikTok Pack' LIMIT 1;

  INSERT INTO public.demands (title, client_id, service_id, status, priority, deadline, scheduled_at, briefing_data)
  VALUES
  ('Campanha Verão 2024', alpha_id, video_service_id, 'TODO', 'High', NOW() + INTERVAL '15 days', NOW() + INTERVAL '2 days', '{"location": "Praia do Forte", "obs": "Levar filtro polarizador"}'::jsonb),
  ('Reels Tech Week', beta_id, reels_service_id, 'DOING', 'Medium', NOW() + INTERVAL '5 days', NOW() - INTERVAL '1 day', '{"format": "9:16", "captions": true}'::jsonb);

END $$;
