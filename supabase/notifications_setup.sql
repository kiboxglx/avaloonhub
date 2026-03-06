-- 1. Cria a Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    related_entity_id UUID,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    group_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilita Segurança (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS (Apenas donos das notificações podem ler/atualizar)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Função Anti-Spam (Group Notifications)
CREATE OR REPLACE FUNCTION public.notify_user_safely(
    p_user_id UUID,
    p_type TEXT,
    p_related_entity_id UUID,
    p_content JSONB
) RETURNS void AS $$
DECLARE
    v_recent_notif_id UUID;
    v_current_count INTEGER;
BEGIN
    -- Busca uma notificação identica e NÃO LIDA nas ultimas 2 horas
    SELECT id, group_count INTO v_recent_notif_id, v_current_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND type = p_type
      AND related_entity_id = p_related_entity_id
      AND read_at IS NULL
      AND updated_at > NOW() - INTERVAL '2 hours'
    ORDER BY updated_at DESC
    LIMIT 1;

    IF v_recent_notif_id IS NOT NULL THEN
        -- Agrupa o spam (aumenta o counter e atualiza a data para ir pro topo)
        UPDATE public.notifications
        SET 
            group_count = v_current_count + 1,
            updated_at = NOW(),
            content = p_content -- Opcional: sobreescrever com o texto mais recente
        WHERE id = v_recent_notif_id;
    ELSE
        -- Cria uma notificação totalmente nova
        INSERT INTO public.notifications (user_id, type, related_entity_id, content)
        VALUES (p_user_id, p_type, p_related_entity_id, p_content);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Habilitar webhooks/realtime para a tabela (de forma idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
