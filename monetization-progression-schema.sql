-- Add monetization, progression, and location fields to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS city text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS win_streak integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS max_win_streak integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS level integer DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS board_skin text DEFAULT 'classic' NOT NULL,
  ADD COLUMN IF NOT EXISTS piece_skin text DEFAULT 'classic' NOT NULL,
  ADD COLUMN IF NOT EXISTS spell_effect text DEFAULT 'classic' NOT NULL,
  ADD COLUMN IF NOT EXISTS unlocked_board_skins text[] DEFAULT ARRAY['classic'] NOT NULL,
  ADD COLUMN IF NOT EXISTS unlocked_piece_skins text[] DEFAULT ARRAY['classic'] NOT NULL,
  ADD COLUMN IF NOT EXISTS unlocked_spell_effects text[] DEFAULT ARRAY['classic'] NOT NULL;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  badge_icon text NOT NULL, -- 'shield' | 'wand' | 'zap' | 'trophy' | 'crown' | 'star'
  xp_reward integer DEFAULT 0 NOT NULL,
  unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, name)
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Disable restrict rules for public viewing
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" 
  ON public.achievements FOR SELECT USING (true);

-- Ensure users can insert achievements if authenticated as themselves (fallback)
DROP POLICY IF EXISTS "Users can unlock their own achievements" ON public.achievements;
CREATE POLICY "Users can unlock their own achievements" 
  ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC function to increment XP manually
CREATE OR REPLACE FUNCTION public.increment_xp(user_id uuid, amount integer)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    xp = xp + amount,
    level = 1 + FLOOR((xp + amount) / 1000)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auto progression, ELO adjustment, and achievements on new matches
CREATE OR REPLACE FUNCTION public.process_match_stats()
RETURNS TRIGGER AS $$
DECLARE
  player_record RECORD;
  is_win BOOLEAN;
  is_loss BOOLEAN;
  is_draw BOOLEAN;
  rating_delta INTEGER := 15;
  xp_gained INTEGER := 50;
  new_rating INTEGER;
  new_win_streak INTEGER;
  new_max_streak INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Fetch current player record
  SELECT rating, wins, losses, draws, games_played, win_streak, max_win_streak, xp, level 
  INTO player_record 
  FROM public.users 
  WHERE id = NEW.user_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Determine result
  IF NEW.winner = 'draw' THEN
    is_draw := TRUE;
    is_win := FALSE;
    is_loss := FALSE;
  ELSIF (NEW.winner = 'white' AND NEW.pgn LIKE '%1-0%') OR 
        (NEW.winner = 'black' AND NEW.pgn LIKE '%0-1%') OR 
        (NEW.winner = NEW.opponent_name) OR
        (NEW.winner = 'white' AND NEW.mode = 'ai') OR
        (NEW.winner = 'white') THEN
    is_win := TRUE;
    is_loss := FALSE;
    is_draw := FALSE;
  ELSE
    is_loss := TRUE;
    is_win := FALSE;
    is_draw := FALSE;
  END IF;

  -- 1. Calculate ELO and Streak Changes
  IF is_win THEN
    new_rating := player_record.rating + rating_delta;
    new_win_streak := player_record.win_streak + 1;
    xp_gained := 100;
  ELSIF is_loss THEN
    new_rating := GREATEST(100, player_record.rating - 12);
    new_win_streak := 0;
    xp_gained := 50;
  ELSE -- Draw
    new_rating := player_record.rating;
    new_win_streak := 0;
    xp_gained := 60;
  END IF;

  new_max_streak := GREATEST(player_record.max_win_streak, new_win_streak);

  -- 2. Calculate XP and Level
  new_xp := player_record.xp + xp_gained;
  new_level := 1 + FLOOR(new_xp / 1000);

  -- 3. Update User Record
  UPDATE public.users
  SET 
    rating = new_rating,
    games_played = games_played + 1,
    wins = wins + CASE WHEN is_win THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN is_loss THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN is_draw THEN 1 ELSE 0 END,
    win_streak = new_win_streak,
    max_win_streak = new_max_streak,
    xp = new_xp,
    level = new_level,
    updated_at = now()
  WHERE id = NEW.user_id;

  -- 4. Check & Award Achievements
  -- Achievement A: First Blood
  IF is_win AND NOT EXISTS (SELECT 1 FROM public.achievements WHERE user_id = NEW.user_id AND name = 'First Blood') THEN
    INSERT INTO public.achievements (user_id, name, description, badge_icon, xp_reward)
    VALUES (NEW.user_id, 'First Blood', 'Win your first chess duel', 'shield', 200);
    
    UPDATE public.users SET xp = xp + 200, level = 1 + FLOOR((xp + 200) / 1000) WHERE id = NEW.user_id;
  END IF;

  -- Achievement B: Spellbinder (Played in spell mode)
  IF (NEW.mode = 'spell' OR NEW.mode = 'pvp' OR NEW.mode = 'ai') AND NOT EXISTS (SELECT 1 FROM public.achievements WHERE user_id = NEW.user_id AND name = 'Spellbinder') THEN
    INSERT INTO public.achievements (user_id, name, description, badge_icon, xp_reward)
    VALUES (NEW.user_id, 'Spellbinder', 'Duel in Chaos Spell Mode', 'wand', 100);
    
    UPDATE public.users SET xp = xp + 100, level = 1 + FLOOR((xp + 100) / 1000) WHERE id = NEW.user_id;
  END IF;

  -- Achievement C: Unstoppable (3 win streak)
  IF new_win_streak >= 3 AND NOT EXISTS (SELECT 1 FROM public.achievements WHERE user_id = NEW.user_id AND name = 'Unstoppable') THEN
    INSERT INTO public.achievements (user_id, name, description, badge_icon, xp_reward)
    VALUES (NEW.user_id, 'Unstoppable', 'Achieve a 3-game win streak', 'zap', 500);
    
    UPDATE public.users SET xp = xp + 500, level = 1 + FLOOR((xp + 500) / 1000) WHERE id = NEW.user_id;
  END IF;

  -- Achievement D: Grandmaster (1400+ ELO)
  IF new_rating >= 1400 AND NOT EXISTS (SELECT 1 FROM public.achievements WHERE user_id = NEW.user_id AND name = 'Grandmaster') THEN
    INSERT INTO public.achievements (user_id, name, description, badge_icon, xp_reward)
    VALUES (NEW.user_id, 'Grandmaster', 'Reach a rating of 1400 ELO', 'trophy', 1000);
    
    UPDATE public.users SET xp = xp + 1000, level = 1 + FLOOR((xp + 1000) / 1000) WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to hook matches to trigger functions
DROP TRIGGER IF EXISTS on_match_completed ON public.matches;
CREATE TRIGGER on_match_completed
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE PROCEDURE public.process_match_stats();
