import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, HeartPulse, AlertCircle, Brain } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

function AnimatedValue({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const animated = useAnimatedNumber(value);
  return <>{prefix}{animated.toFixed(decimals)}{suffix}</>;
}

export function MonitoringWidgets() {
  const { products, queries } = useHypermarketStore();

  const criticalItems = products.filter(p => p.stock < p.reorderLevel).length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.currentPrice * p.demandForecast), 0);
  const stockHealth = Math.round(((products.length - criticalItems) / products.length) * 100);
  const pendingOrders = queries.filter(q => q.status === 'pending').length;
  const aiConfidence = useMemo(() => Math.round(85 + Math.random() * 10), []);

  const widgets = [
    {
      label: 'Revenue Today',
      renderValue: <AnimatedValue value={totalRevenue / 1000} prefix="$" suffix="k" decimals={1} />,
      icon: DollarSign,
      borderClass: 'border-l-primary',
      iconClass: 'text-primary bg-primary/10',
    },
    {
      label: 'Orders Pending',
      renderValue: <AnimatedValue value={pendingOrders} />,
      icon: ShoppingCart,
      borderClass: 'border-l-warning',
      iconClass: 'text-warning bg-warning/10',
    },
    {
      label: 'Stock Health',
      renderValue: <AnimatedValue value={stockHealth} suffix="%" />,
      icon: HeartPulse,
      borderClass: stockHealth >= 80 ? 'border-l-success' : stockHealth >= 50 ? 'border-l-warning' : 'border-l-destructive',
      iconClass: stockHealth >= 80 ? 'text-success bg-success/10' : stockHealth >= 50 ? 'text-warning bg-warning/10' : 'text-destructive bg-destructive/10',
    },
    {
      label: 'Alerts Active',
      renderValue: <AnimatedValue value={criticalItems} />,
      icon: AlertCircle,
      borderClass: criticalItems > 3 ? 'border-l-destructive' : criticalItems > 0 ? 'border-l-warning' : 'border-l-success',
      iconClass: criticalItems > 3 ? 'text-destructive bg-destructive/10' : criticalItems > 0 ? 'text-warning bg-warning/10' : 'text-success bg-success/10',
    },
    {
      label: 'AI Confidence',
      renderValue: <AnimatedValue value={aiConfidence} suffix="%" />,
      icon: Brain,
      borderClass: 'border-l-accent',
      iconClass: 'text-accent bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {widgets.map((w, i) => (
        <motion.div
          key={w.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "glow-card p-3 border-l-[3px] flex items-center gap-3",
            w.borderClass
          )}
        >
          <div className={cn("p-2 rounded-lg", w.iconClass)}>
            <w.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-display font-bold text-foreground leading-none">{w.renderValue}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{w.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
