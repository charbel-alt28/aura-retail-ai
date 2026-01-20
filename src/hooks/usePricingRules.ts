import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type PricingRule = Tables<'pricing_rules'>;
export type PricingRuleInsert = TablesInsert<'pricing_rules'>;
export type PricingRuleUpdate = TablesUpdate<'pricing_rules'>;

export function usePricingRules() {
  return useQuery({
    queryKey: ['pricing_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as PricingRule[];
    },
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: PricingRuleInsert) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert([rule])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing_rules'] });
      toast.success('Pricing rule created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create pricing rule: ${error.message}`);
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PricingRuleUpdate }) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing_rules'] });
      toast.success('Pricing rule updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update pricing rule: ${error.message}`);
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing_rules'] });
      toast.success('Pricing rule deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete pricing rule: ${error.message}`);
    },
  });
}
