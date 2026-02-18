
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'viewer');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create user_roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Create auth_audit_logs table for security audit trail
CREATE TABLE public.auth_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'operator' THEN 2 
      WHEN 'viewer' THEN 3 
    END
  LIMIT 1
$$;

-- 8. RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. RLS Policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. RLS Policies for auth_audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON public.auth_audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON public.auth_audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.auth_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 11. Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- First user automatically becomes admin
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'operator');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Update RLS on existing tables to require authentication
-- Products: authenticated users can read, operators/admins can write
DROP POLICY IF EXISTS "Public read access" ON public.products;
DROP POLICY IF EXISTS "Public insert access" ON public.products;
DROP POLICY IF EXISTS "Public update access" ON public.products;
DROP POLICY IF EXISTS "Public delete access" ON public.products;

CREATE POLICY "Authenticated users can read products"
  ON public.products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operators can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Operators can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- Agents: authenticated users can read, operators/admins can write
DROP POLICY IF EXISTS "Public read access" ON public.agents;
DROP POLICY IF EXISTS "Public insert access" ON public.agents;
DROP POLICY IF EXISTS "Public update access" ON public.agents;
DROP POLICY IF EXISTS "Public delete access" ON public.agents;

CREATE POLICY "Authenticated users can read agents"
  ON public.agents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operators can insert agents"
  ON public.agents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Operators can update agents"
  ON public.agents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Admins can delete agents"
  ON public.agents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- Pricing rules: authenticated users can read, operators/admins can write
DROP POLICY IF EXISTS "Public read access" ON public.pricing_rules;
DROP POLICY IF EXISTS "Public insert access" ON public.pricing_rules;
DROP POLICY IF EXISTS "Public update access" ON public.pricing_rules;
DROP POLICY IF EXISTS "Public delete access" ON public.pricing_rules;

CREATE POLICY "Authenticated users can read pricing rules"
  ON public.pricing_rules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operators can insert pricing rules"
  ON public.pricing_rules FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Operators can update pricing rules"
  ON public.pricing_rules FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Admins can delete pricing rules"
  ON public.pricing_rules FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- Customer queries
DROP POLICY IF EXISTS "Public read access" ON public.customer_queries;
DROP POLICY IF EXISTS "Public insert access" ON public.customer_queries;
DROP POLICY IF EXISTS "Public update access" ON public.customer_queries;
DROP POLICY IF EXISTS "Public delete access" ON public.customer_queries;

CREATE POLICY "Authenticated users can read customer queries"
  ON public.customer_queries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operators can insert customer queries"
  ON public.customer_queries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Operators can update customer queries"
  ON public.customer_queries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Admins can delete customer queries"
  ON public.customer_queries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- Agent logs
DROP POLICY IF EXISTS "Public read access" ON public.agent_logs;
DROP POLICY IF EXISTS "Public insert access" ON public.agent_logs;

CREATE POLICY "Authenticated users can read agent logs"
  ON public.agent_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operators can insert agent logs"
  ON public.agent_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

-- Timestamps trigger for new tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
