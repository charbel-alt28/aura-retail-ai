
-- Fix 1: Restrict customer_queries SELECT to admin/operator roles only
DROP POLICY IF EXISTS "Authenticated users can read customer queries" ON public.customer_queries;
CREATE POLICY "Authorized users can read customer queries"
  ON public.customer_queries FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role)
  );

-- Fix 2: Create a secure has_role that only checks the calling user's own role
-- First create the new function
CREATE OR REPLACE FUNCTION public.has_own_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;

-- Now replace has_role to enforce auth.uid() internally, ignoring the _user_id param
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;
