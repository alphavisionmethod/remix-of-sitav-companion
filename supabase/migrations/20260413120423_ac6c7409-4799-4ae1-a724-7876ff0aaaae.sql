
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create org_members table
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Security definer function: check if user is member of org
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Security definer function: check if user is org owner
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  )
$$;

-- Organizations: members can view their org
CREATE POLICY "Members can view their organization"
ON public.organizations FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), id));

-- Organizations: owners can update
CREATE POLICY "Owners can update their organization"
ON public.organizations FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

-- Organizations: any authenticated user can create
CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Organizations: owners can delete
CREATE POLICY "Owners can delete their organization"
ON public.organizations FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Org members: members can view other members in their org
CREATE POLICY "Members can view org members"
ON public.org_members FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), org_id));

-- Org members: owners can add members
CREATE POLICY "Owners can add org members"
ON public.org_members FOR INSERT TO authenticated
WITH CHECK (public.is_org_owner(auth.uid(), org_id));

-- Org members: owners can remove members
CREATE POLICY "Owners can remove org members"
ON public.org_members FOR DELETE TO authenticated
USING (public.is_org_owner(auth.uid(), org_id));

-- Org members: owners can update roles
CREATE POLICY "Owners can update org members"
ON public.org_members FOR UPDATE TO authenticated
USING (public.is_org_owner(auth.uid(), org_id));

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
BEFORE UPDATE ON public.org_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.org_members(org_id);
