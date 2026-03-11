import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHypermarketStore } from '@/lib/store';
import { toast } from 'sonner';

export type AIAction = 'optimize' | 'forecast' | 'anomaly' | 'recommendations';

export interface AIResult {
  action: AIAction;
  result: any;
  timestamp: Date;
}

const ACTION_LABELS: Record<AIAction, string> = {
  optimize: 'Optimization',
  forecast: 'Forecast',
  anomaly: 'Anomaly Detection',
  recommendations: 'Recommendations',
};

export function useAIAutomation() {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [results, setResults] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { products } = useHypermarketStore();

  const runAction = useCallback(async (action: AIAction) => {
    if (loading) {
      toast.warning('An AI action is already running. Please wait.');
      return null;
    }

    if (!products || products.length === 0) {
      toast.error('No products available for analysis');
      return null;
    }

    setLoading(action);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-automation', {
        body: { action, products },
      });

      if (fnError) {
        // Supabase function invoke wraps HTTP errors
        const message = fnError.message || 'AI operation failed';
        throw new Error(message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.result) {
        throw new Error('AI returned no results. Please try again.');
      }

      const result: AIResult = {
        action,
        result: data.result,
        timestamp: new Date(),
      };
      setResults(result);
      toast.success(`AI ${ACTION_LABELS[action]} completed successfully`);
      return result;
    } catch (err: any) {
      const message = err?.message || 'AI operation failed';

      // Provide user-friendly messages for common errors
      if (message.includes('429') || message.includes('rate limit') || message.includes('Too many')) {
        toast.error('Rate limit reached. Please wait a moment before trying again.');
      } else if (message.includes('402') || message.includes('credits')) {
        toast.error('AI credits exhausted. Please add credits in Settings → Workspace → Usage.');
      } else if (message.includes('403') || message.includes('permission')) {
        toast.error('Insufficient permissions for this AI action.');
      } else if (message.includes('401') || message.includes('auth')) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(message);
      }

      setError(message);
      return null;
    } finally {
      setLoading(null);
    }
  }, [loading, products]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { loading, results, error, setResults, clearResults, runAction };
}
