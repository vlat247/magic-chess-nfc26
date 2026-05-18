-- Create users table extending Supabase Auth
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text unique,
  avatar_url text,
  is_guest boolean default false,
  rating integer default 1200,
  games_played integer default 0,
  wins integer default 0,
  losses integer default 0,
  draws integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Users can read all users (needed for profiles/leaderboards)
create policy "Users are viewable by everyone" 
  on public.users for select using (true);

-- Users can update their own profile
create policy "Users can update their own profile" 
  on public.users for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, username, avatar_url, is_guest)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name', 'Guest_' || substr(new.id::text, 1, 6)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'is_guest')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete set null,
  opponent_name text,
  pgn text not null,
  winner text, -- 'white', 'black', 'draw'
  mode text, -- 'pvp', 'ai'
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on matches
alter table public.matches enable row level security;

-- Everyone can read matches (for profile viewing)
create policy "Matches are viewable by everyone" 
  on public.matches for select using (true);

-- Authenticated users can insert their own matches
create policy "Users can insert their own matches" 
  on public.matches for insert with check (auth.uid() = user_id);

-- Create subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  status text not null,
  plan text not null, -- 'free', 'pro'
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- Users can view their own subscriptions
create policy "Users can view own subscriptions" 
  on public.subscriptions for select using (auth.uid() = user_id);

-- Create leaderboard view
create view public.leaderboard as
  select id, username, avatar_url, rating, wins, games_played
  from public.users
  where is_guest = false
  order by rating desc, wins desc;
