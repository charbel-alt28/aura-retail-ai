import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type CustomerQuery = Tables<'customer_queries'>;
export type CustomerQueryInsert = TablesInsert<'customer_queries'>;
export type CustomerQueryUpdate = TablesUpdate<'customer_queries'>;

export function useCustomerQueries() {
  return useQuery({
    queryKey: ['customer_queries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_queries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CustomerQuery[];
    },
  });
}

export function useCreateCustomerQuery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (query: CustomerQueryInsert) => {
      const { data, error } = await supabase
        .from('customer_queries')
        .insert([query])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_queries'] });
      toast.success('Query submitted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to submit query: ${error.message}`);
    },
  });
}

export function useUpdateCustomerQuery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CustomerQueryUpdate }) => {
      const { data, error } = await supabase
        .from('customer_queries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_queries'] });
      toast.success('Query updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update query: ${error.message}`);
    },
  });
}

export function useDeleteCustomerQuery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_queries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_queries'] });
      toast.success('Query deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete query: ${error.message}`);
    },
  });
}
