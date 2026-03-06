-- Criação da Procedure de Agendamento Seguro (Double-Booking Prevention)
-- Isso usa FOR UPDATE para bloquear a leitura concorrente do mesmo membro (assigned_to)

CREATE OR REPLACE FUNCTION book_demand_safely(
  p_title TEXT,
  p_client_id UUID,
  p_assigned_to UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_duration_hours NUMERIC,
  p_area TEXT,
  p_type TEXT,
  p_priority TEXT,
  p_status TEXT,
  p_briefing_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict_count INT;
  v_end_time TIMESTAMPTZ;
  v_new_demand RECORD;
  v_locked_member RECORD;
BEGIN
  -- Se não tiver agendamento ou não tiver responsável, insere direto sem travar agenda
  IF p_assigned_to IS NULL OR p_scheduled_at IS NULL THEN
     INSERT INTO demands (title, client_id, assigned_to, scheduled_at, area, type, priority, status, briefing_data)
     VALUES (p_title, p_client_id, p_assigned_to, p_scheduled_at, p_area, p_type, p_priority, p_status, p_briefing_data)
     RETURNING * INTO v_new_demand;
     
     RETURN row_to_json(v_new_demand);
  END IF;

  -- 1. Cria um lock na linha do team_member para evitar condição de corrida entre requests no mesmo ms
  SELECT * INTO v_locked_member FROM team_members WHERE id = p_assigned_to FOR UPDATE;

  -- O v_end_time é o horário de término pretendido pelo usuário (Ex: 14h + 2h = 16h)
  v_end_time := p_scheduled_at + (p_duration_hours || ' hours')::INTERVAL;

  -- 2. Verifica Conflitos daquele membro com Lock Ativo
  -- Um conflito ocorre se as datas de duas reuniões se sobrepõem: (StartA < EndB) AND (EndA > StartB)
  SELECT COUNT(*) INTO v_conflict_count
  FROM demands
  WHERE assigned_to = p_assigned_to
    AND scheduled_at IS NOT NULL
    AND scheduled_at < v_end_time
    AND (scheduled_at + ((COALESCE(briefing_data->>'duration_hours', '1')::NUMERIC) || ' hours')::INTERVAL) > p_scheduled_at;

  IF v_conflict_count > 0 THEN
    -- Erro que será capitulado no frontend como error.message
    RAISE EXCEPTION 'SCHEDULING_CONFLICT: O profissional selecionado já possui uma demanda alocada neste horário e duração.';
  END IF;

  -- 3. Inserção Segura se não houve erro
  INSERT INTO demands (title, client_id, assigned_to, scheduled_at, area, type, priority, status, briefing_data)
  VALUES (p_title, p_client_id, p_assigned_to, p_scheduled_at, p_area, p_type, p_priority, p_status, p_briefing_data)
  RETURNING * INTO v_new_demand;

  RETURN row_to_json(v_new_demand);
END;
$$;
