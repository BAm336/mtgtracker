-- Fix: allow group creator to see the group immediately after INSERT
-- INSERT ... RETURNING requires the SELECT policy to pass,
-- but the user isn't in group_members yet at that point.

DROP POLICY "Users can see groups they are members of" ON public.groups;

CREATE POLICY "Users can see groups they are members of"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_group_member(id, auth.uid())
  );
