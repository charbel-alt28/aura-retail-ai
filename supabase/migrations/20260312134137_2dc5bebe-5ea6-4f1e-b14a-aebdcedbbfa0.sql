
-- Fix has_role function: it was using auth.uid() instead of the _user_id parameter
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fix get_user_role function: also using auth.uid() instead of _user_id
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role::text FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'operator' THEN 2 
      WHEN 'inventory_manager' THEN 3
      WHEN 'pricing_manager' THEN 4
      WHEN 'viewer' THEN 5 
    END
  LIMIT 1
$$;
