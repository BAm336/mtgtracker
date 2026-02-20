-- Create decks table (shared within a group, not personal)
CREATE TABLE public.decks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  owner_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          varchar(100) NOT NULL,
  colors        text[] NOT NULL,  -- ['W','U','B','R','G'] or ['C'] for colorless
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fetching decks by group
CREATE INDEX idx_decks_group_id ON public.decks(group_id);

-- RLS for decks
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can see decks of their groups"
  ON public.decks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = decks.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create decks in their groups"
  ON public.decks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = decks.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update decks in their groups"
  ON public.decks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = decks.group_id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete decks in their groups"
  ON public.decks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = decks.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- Add deck_id (reference to library) and deck_colors (snapshot) to game_players
ALTER TABLE public.game_players
  ADD COLUMN deck_id     uuid REFERENCES public.decks(id) ON DELETE SET NULL,
  ADD COLUMN deck_colors text[] NOT NULL DEFAULT '{}';
