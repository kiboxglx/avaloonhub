-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles (Extends Auth Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'videomaker', -- 'admin', 'traffic_manager', 'videomaker', 'editor'
  sector text, -- 'Management', 'Production', 'Marketing'
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 3. Clients
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  sector text,
  tier text, -- 'Tier 1', 'Tier 2', 'Tier 3'
  monthly_value numeric,
  status text default 'Active', -- 'Active', 'Pending', 'Inactive'
  logo_url text,
  drive_link text,
  social_accounts jsonb default '[]'::jsonb -- Stores array of {platform, username, password}
);
alter table public.clients enable row level security;
create policy "Clients are viewable by authenticated users" on public.clients for select using (auth.role() = 'authenticated');
create policy "Clients editable by authenticated users" on public.clients for all using (auth.role() = 'authenticated'); -- Simplify for now

-- 4. Services
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  base_price numeric
);
alter table public.services enable row level security;
create policy "Services viewable by auth users" on public.services for select using (auth.role() = 'authenticated');

-- 5. Demands (Projects/Jobs)
create table public.demands (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  
  -- Foreign Keys
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  
  status text default 'TODO', -- 'TODO', 'DOING', 'REVIEW', 'DONE'
  priority text default 'Medium', -- 'Low', 'Medium', 'High'
  
  deadline timestamp with time zone, -- Prazo de entrega
  scheduled_at timestamp with time zone, -- Data e Horário do Job (Questionário)
  
  briefing_data jsonb default '{}'::jsonb -- "E etc" (respostas flexíveis do questionário)
);
alter table public.demands enable row level security;
create policy "Demands viewable by auth users" on public.demands for select using (auth.role() = 'authenticated');
create policy "Demands editable by auth users" on public.demands for all using (auth.role() = 'authenticated');

-- 6. Inventory Items
create table public.inventory_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null, -- 'Cameras', 'Lentes', 'Audio', 'Iluminacao'
  status text default 'Available', -- 'Available' (Disponível), 'In Use' (Em Uso), 'Maintenance' (Manutenção)
  
  assignee_id uuid references public.profiles(id) on delete set null, -- Quem está com o equipamento
  return_date date,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.inventory_items enable row level security;
create policy "Inventory viewable by auth users" on public.inventory_items for select using (auth.role() = 'authenticated');
create policy "Inventory editable by auth users" on public.inventory_items for all using (auth.role() = 'authenticated');

-- 7. Financial Records
create table public.financial_records (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  profile_id uuid references public.profiles(id) on delete set null, -- Quem recebeu/pagou
  demand_id uuid references public.demands(id) on delete set null, -- Vinculado a qual projeto
  
  description text not null,
  amount numeric not null,
  type text not null, -- 'income' (receita), 'expense' (despesa)
  status text default 'Pending', -- 'Paid', 'Pending', 'Processing'
  due_date timestamp with time zone
);
alter table public.financial_records enable row level security;
create policy "Financials viewable by auth users" on public.financial_records for select using (auth.role() = 'authenticated');
create policy "Financials editable by auth users" on public.financial_records for all using (auth.role() = 'authenticated');

-- 8. Activity Logs (Optional but good for history)
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb
);
alter table public.activity_logs enable row level security;
create policy "Logs viewable by auth users" on public.activity_logs for select using (auth.role() = 'authenticated');

-- 9. Trigger to create Profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'videomaker');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
