import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WastageLog {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  category: string | null;
  quantity_discarded: number;
  unit_value: number;
  total_value_lost: number;
  expiry_date: string | null;
  date_discarded: string;
  reason: string;
  notes: string | null;
  logged_by: string | null;
  created_at: string;
}

export interface WastageLogInsert {
  product_id: string;
  product_name: string;
  sku: string;
  category?: string | null;
  quantity_discarded: number;
  unit_value: number;
  total_value_lost: number;
  expiry_date?: string | null;
  date_discarded?: string;
  reason: string;
  notes?: string | null;
  logged_by?: string | null;
}

export function useWastageLogs() {
  return useQuery({
    queryKey: ['wastage_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wastage_logs')
        .select('*')
        .order('date_discarded', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as WastageLog[];
    },
  });
}

export function useWastageStats() {
  return useQuery({
    queryKey: ['wastage_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wastage_logs')
        .select('*')
        .order('date_discarded', { ascending: false });

      if (error) throw error;
      const logs = data as WastageLog[];

      const totalItems = logs.reduce((s, l) => s + l.quantity_discarded, 0);
      const totalValue = logs.reduce((s, l) => s + Number(l.total_value_lost), 0);

      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentLogs = logs.filter(l => new Date(l.date_discarded) >= sevenDaysAgo);
      const recentItems = recentLogs.reduce((s, l) => s + l.quantity_discarded, 0);
      const recentValue = recentLogs.reduce((s, l) => s + Number(l.total_value_lost), 0);

      // By reason
      const byReason: Record<string, { count: number; value: number }> = {};
      for (const l of logs) {
        if (!byReason[l.reason]) byReason[l.reason] = { count: 0, value: 0 };
        byReason[l.reason].count += l.quantity_discarded;
        byReason[l.reason].value += Number(l.total_value_lost);
      }

      return { totalItems, totalValue, recentItems, recentValue, byReason, totalEntries: logs.length };
    },
  });
}

export function useCreateWastageLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: WastageLogInsert) => {
      const { data, error } = await supabase
        .from('wastage_logs')
        .insert([log])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastage_logs'] });
      queryClient.invalidateQueries({ queryKey: ['wastage_stats'] });
      toast.success('Wastage log entry created');
    },
    onError: (error) => {
      toast.error(`Failed to log wastage: ${error.message}`);
    },
  });
}
