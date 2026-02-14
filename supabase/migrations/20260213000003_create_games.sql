-- Create game_formats table
CREATE TABLE public.game_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) UNIQUE NOT NULL
);

-- Create games table
CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  format_id uuid NOT NULL REFERENCES public.game_formats(id),
  played_at date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for chronological game history per group
CREATE INDEX idx_games_group_played_at ON public.games(group_id, played_at);

-- Trigger for updated_at
CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create game_players table
CREATE TABLE public.game_players (
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  deck_name varchar(100),
  commander varchar(100),
  is_winner boolean NOT NULL DEFAULT false,
  PRIMARY KEY (game_id, user_id)
);

-- Index for player stats
CREATE INDEX idx_game_players_user_id ON public.game_players(user_id);

-- RLS for game_formats
ALTER TABLE public.game_formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game formats"
  ON public.game_formats FOR SELECT
  TO authenticated
  USING (true);

-- RLS for games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can see games of their groups"
  ON public.games FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create games in their groups"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update games in their groups"
  ON public.games FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete games in their groups"
  ON public.games FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLS for game_players
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can see game players of their groups"
  ON public.game_players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_players.game_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add players to games in their groups"
  ON public.game_players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_players.game_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update game players in their groups"
  ON public.game_players FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_players.game_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete game players in their groups"
  ON public.game_players FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_players.game_id
        AND group_members.user_id = auth.uid()
    )
  );
