-- ============================================================
-- Arcane Chess — Multiplayer Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- game_rooms: authoritative source of truth for every live game
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id              text PRIMARY KEY,                  -- nanoid(8) e.g. "abc12XYZ"
  host_id         uuid REFERENCES public.users(id) ON DELETE SET NULL,
  guest_id        uuid REFERENCES public.users(id) ON DELETE SET NULL,
  host_color      text NOT NULL DEFAULT 'white',     -- 'white' | 'black'
  status          text NOT NULL DEFAULT 'waiting',   -- 'waiting' | 'active' | 'finished' | 'abandoned'
  fen             text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn_history     text[] NOT NULL DEFAULT '{}',      -- array of SAN move strings
  move_seq        integer NOT NULL DEFAULT 0,        -- monotonic move counter (anti-desync)
  time_white      integer NOT NULL DEFAULT 600,      -- seconds remaining for white
  time_black      integer NOT NULL DEFAULT 600,      -- seconds remaining for black
  time_control    integer NOT NULL DEFAULT 600,      -- initial seconds per player
  winner          text,                              -- 'white' | 'black' | 'draw' | null
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game rooms"
  ON public.game_rooms FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.game_rooms FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Room players can update their room"
  ON public.game_rooms FOR UPDATE
  USING (
    -- Host or existing guest can always update
    auth.uid() = host_id
    OR auth.uid() = guest_id
    -- Any authenticated user can join a waiting room that has no guest yet
    OR (status = 'waiting' AND guest_id IS NULL AND auth.uid() IS NOT NULL)
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_game_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_game_room_update
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_game_room_timestamp();

-- ============================================================
-- matchmaking_queue: ephemeral queue for quickmatch pairing
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  user_id         uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  time_control    integer NOT NULL DEFAULT 600,
  entered_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own queue entry"
  ON public.matchmaking_queue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read matchmaking queue"
  ON public.matchmaking_queue FOR SELECT USING (true);

-- Enable Realtime on game_rooms (for presence/reconnect awareness)
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
