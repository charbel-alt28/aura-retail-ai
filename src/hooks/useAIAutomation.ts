import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHypermarketStore } from '@/lib/store';
import { toast } from 'sonner';

export type AIAction = 'optimize' | 'forecast' | 'anomaly' | 'recommendations';

export interface AIResult {
  action: AIAction;
  result: any;
  timestamp: Date;
}

export function useAIAutomation() {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [results, setResults] = useState<AIResult | null>(null);
  const { products } = useHypermarketStore();

  const runAction = async (action: AIAction) => {
    setLoading(action);
    try {
      const { data, error } = await supabase.functions.invoke('ai-automation', {
        body: { action, products },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result: AIResult = {
        action,
        result: data.result,
        timestamp: new Date(),
      };
      setResults(result);
      toast.success(`AI ${action} completed successfully`);
      return result;
    } catch (err: any) {
      const message = err?.message || 'AI operation failed';
      toast.error(message);
      return null;
    } finally {
      setLoading(null);
    }
  };

  return { loading, results, setResults, runAction };
}
