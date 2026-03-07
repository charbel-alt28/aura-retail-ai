
-- Wastage logs table for permanent tracking of discarded/expired items
CREATE TABLE public.wastage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_name text NOT NULL,
  sku text NOT NULL,
  category text,
  quantity_discarded integer NOT NULL DEFAULT 0,
  unit_value numeric NOT NULL DEFAULT 0,
  total_value_lost numeric NOT NULL DEFAULT 0,
  expiry_date date,
  date_discarded timestamp with time zone NOT NULL DEFAULT now(),
  reason text NOT NULL DEFAULT 'expired',
  notes text,
  logged_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wastage_logs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read wastage logs
CREATE POLICY "Authenticated users can read wastage logs"
  ON public.wastage_logs FOR SELECT TO authenticated
  USING (true);

-- Operators and admins can insert wastage logs
CREATE POLICY "Operators can insert wastage logs"
  ON public.wastage_logs FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role) OR
    has_role(auth.uid(), 'inventory_manager'::app_role)
  );

-- Admins can delete wastage logs
CREATE POLICY "Admins can delete wastage logs"
  ON public.wastage_logs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
