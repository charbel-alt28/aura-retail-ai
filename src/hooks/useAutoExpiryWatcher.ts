import { useEffect, useRef, useCallback } from 'react';
import { useHypermarketStore } from '@/lib/store';
import { productMetadata } from '@/lib/productMetadata';
import { useCreateWastageLog } from '@/hooks/useWastageLogs';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Auto-Expiry Watcher
 * 
 * On mount and every 60 seconds:
 * 1. Scans all products against current system date/time
 * 2. Auto-flags expired items (expiry ≤ today)
 * 3. Auto-logs them to wastage_logs with zero manual intervention
 * 4. Deduplicates so each product is only logged once per day
 * 5. Subscribes to realtime wastage_logs changes for live updates
 * 
 * Data source: POS system sync (productMetadata) with automatic timestamp updates
 */
export function useAutoExpiryWatcher() {
  const { products, updateStock, addAgentLog } = useHypermarketStore();
  const createWastageLog = useCreateWastageLog();
  const queryClient = useQueryClient();
  const processedRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scanAndFlag = useCallback(async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayKey = now.toISOString().split('T')[0];
    let flaggedCount = 0;
    let totalValueFlagged = 0;

    // Check existing wastage logs to avoid duplicates
    const { data: existingLogs } = await supabase
      .from('wastage_logs')
      .select('product_id, date_discarded')
      .gte('date_discarded', `${todayKey}T00:00:00Z`);

    const alreadyLogged = new Set(
      (existingLogs || []).map(l => l.product_id)
    );

    for (const product of products) {
      const meta = productMetadata[product.id];
      if (!meta?.doe) continue;

      const expiryDate = new Date(meta.doe + 'T00:00:00');
      const dedupKey = `${product.id}-${todayKey}`;

      // Skip if already processed in memory or already in DB
      if (processedRef.current.has(dedupKey)) continue;
      if (alreadyLogged.has(product.id)) {
        processedRef.current.add(dedupKey);
        continue;
      }

      // Auto-flag expired items
      if (expiryDate <= now && product.stock > 0) {
        const valueLost = product.stock * product.currentPrice;

        createWastageLog.mutate({
          product_id: product.id,
          product_name: product.name,
          sku: `SKU-${product.id.padStart(3, '0')}`,
          category: product.category,
          quantity_discarded: product.stock,
          unit_value: product.currentPrice,
          total_value_lost: valueLost,
          expiry_date: meta.doe,
          reason: 'expired',
          notes: `Auto-flagged by system — expired on ${meta.doe}. Storage: ${meta.storageLocation || 'Unknown zone'}`,
        });

        // Zero out stock for expired items
        updateStock(product.id, 0);

        processedRef.current.add(dedupKey);
        flaggedCount++;
        totalValueFlagged += valueLost;
      }
    }

    if (flaggedCount > 0) {
      addAgentLog({
        agent: 'inventory',
        action: 'AUTO_EXPIRY_FLAG',
        details: `Auto-flagged ${flaggedCount} expired products. Total value: $${totalValueFlagged.toFixed(2)}. Logged to wastage and stock zeroed.`,
        status: 'warning',
      });

      toast.warning(
        `Auto-detected ${flaggedCount} expired items — $${totalValueFlagged.toFixed(0)} flagged as wastage`,
        { duration: 8000 }
      );
    }
  }, [products, createWastageLog, updateStock, addAgentLog]);

  // Run on mount and every 60 seconds
  useEffect(() => {
    // Initial scan after a short delay (wait for auth)
    const initialTimer = setTimeout(() => {
      scanAndFlag();
    }, 3000);

    // Periodic scan every 60 seconds
    intervalRef.current = setInterval(scanAndFlag, 60000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scanAndFlag]);

  // Realtime subscription on wastage_logs for live dashboard updates
  useEffect(() => {
    const channel = supabase
      .channel('wastage-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wastage_logs' },
        () => {
          // Invalidate queries so dashboard updates in real-time
          queryClient.invalidateQueries({ queryKey: ['wastage_logs'] });
          queryClient.invalidateQueries({ queryKey: ['wastage_stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
