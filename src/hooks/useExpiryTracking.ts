import { useMemo } from 'react';
import { useHypermarketStore } from '@/lib/store';
import { productMetadata } from '@/lib/productMetadata';

export interface ExpiryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  currentPrice: number;
  expiryDate: Date;
  daysUntilExpiry: number;
  totalValueAtRisk: number;
  status: 'expired' | 'critical' | 'warning' | 'ok';
  recommendedAction: string;
}

export interface ExpiryStats {
  totalExpiringWithin3Days: number;
  totalAlreadyExpired: number;
  unitsExpiringWithin3Days: number;
  unitsAlreadyExpired: number;
  valueAtRisk: number;
  valueAlreadyLost: number;
  expiringItems: ExpiryItem[];
  expiredItems: ExpiryItem[];
  warningItems: ExpiryItem[];
  allTrackedItems: ExpiryItem[];
}

export function useExpiryTracking(): ExpiryStats {
  const { products } = useHypermarketStore();

  return useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const allTracked: ExpiryItem[] = [];

    for (const product of products) {
      const meta = productMetadata[product.id];
      if (!meta?.doe) continue;

      const expiryDate = new Date(meta.doe + 'T00:00:00');
      const diffMs = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const totalValueAtRisk = product.stock * product.currentPrice;

      let status: ExpiryItem['status'] = 'ok';
      let recommendedAction = 'No action needed';

      if (daysUntilExpiry <= 0) {
        status = 'expired';
        recommendedAction = 'Discard immediately — log as wastage';
      } else if (daysUntilExpiry <= 2) {
        status = 'critical';
        recommendedAction = 'Apply 50%+ discount or donate';
      } else if (daysUntilExpiry <= 3) {
        status = 'warning';
        recommendedAction = 'Apply 25-30% promotional discount';
      }

      if (status !== 'ok') {
        allTracked.push({
          id: product.id,
          name: product.name,
          category: product.category,
          stock: product.stock,
          currentPrice: product.currentPrice,
          expiryDate,
          daysUntilExpiry,
          totalValueAtRisk,
          status,
          recommendedAction,
        });
      }
    }

    allTracked.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    const expiredItems = allTracked.filter(i => i.status === 'expired');
    const expiringItems = allTracked.filter(i => i.status === 'critical' || i.status === 'warning');
    const warningItems = allTracked.filter(i => i.status === 'warning');

    return {
      totalExpiringWithin3Days: expiringItems.length,
      totalAlreadyExpired: expiredItems.length,
      unitsExpiringWithin3Days: expiringItems.reduce((s, i) => s + i.stock, 0),
      unitsAlreadyExpired: expiredItems.reduce((s, i) => s + i.stock, 0),
      valueAtRisk: expiringItems.reduce((s, i) => s + i.totalValueAtRisk, 0),
      valueAlreadyLost: expiredItems.reduce((s, i) => s + i.totalValueAtRisk, 0),
      expiringItems,
      expiredItems,
      warningItems,
      allTrackedItems: allTracked,
    };
  }, [products]);
}
