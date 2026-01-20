import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AgentLog = Tables<'agent_logs'>;
export type AgentLogInsert = TablesInsert<'agent_logs'>;

export function useAgentLogs() {
  return useQuery({
    queryKey: ['agent_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AgentLog[];
    },
  });
}

export function useCreateAgentLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: AgentLogInsert) => {
      const { data, error } = await supabase
        .from('agent_logs')
        .insert([log])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent_logs'] });
    },
    onError: (error) => {
      toast.error(`Failed to create log: ${error.message}`);
    },
  });
}
