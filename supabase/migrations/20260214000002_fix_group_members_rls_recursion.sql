-- Fix infinite recursion in group_members RLS policy
-- The SELECT policy on group_members references group_members itself,
-- causing infinite recursion. Use a SECURITY DEFINER function to bypass RLS.

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
  );
$$;

-- Drop the recursive policies
DROP POLICY "Users can see members of their groups" ON public.group_members;
DROP POLICY "Members can see invitations of their groups" ON public.group_invitations;
DROP POLICY "Members can create invitations" ON public.group_invitations;

-- Recreate without recursion
CREATE POLICY "Users can see members of their groups"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can see invitations of their groups"
  ON public.group_invitations FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can create invitations"
  ON public.group_invitations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_group_member(group_id, auth.uid()));
