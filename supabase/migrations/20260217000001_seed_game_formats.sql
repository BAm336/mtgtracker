-- Seed default game formats (idempotent)
INSERT INTO public.game_formats (name) VALUES
  ('Pioneer'),
  ('Limité'),
  ('Commander'),
  ('Autre')
ON CONFLICT (name) DO NOTHING;
