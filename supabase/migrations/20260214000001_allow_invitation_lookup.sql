-- Allow authenticated users to look up non-expired invitations by code
-- Required for the join-group flow (user is not yet a member)
CREATE POLICY "Authenticated users can lookup valid invitations"
  ON public.group_invitations FOR SELECT
  TO authenticated
  USING (expires_at > now());
