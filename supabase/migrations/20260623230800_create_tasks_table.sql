-- Create tasks table
create table public.tasks (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  description text,
  completed boolean not null default false,
  category text not null,
  priority text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  start_date date
  end_date date,
  start_time text,
  end_time text,
  reminder_time timestamp with time zone
);

-- Enable Row Level Security (RLS)
alter table public.tasks enable row level security;

-- Create RLS Policies
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
