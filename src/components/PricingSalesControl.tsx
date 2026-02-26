import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Tag, BarChart3, PieChart, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { useAIAutomation } from '@/hooks/useAIAutomation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function PricingSalesControl() {
  const { products, adjustPrice, applyPromotion, addAgentLog } = useHypermarketStore();
  const { runAction, loading } = useAIAutomation();
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const optimizableItems = products.filter(p => p.currentPrice === p.basePrice && p.demandLevel !== 'medium');
  const lowMarginItems = products.filter(p => {
    const margin = ((p.currentPrice - p.basePrice * 0.6) / p.currentPrice) * 100;
    return margin < 20;
  });

  const handleOptimizePrices = async () => {
    setOptimizing(true);
    addAgentLog({ agent: 'pricing', action: 'OPTIMIZE_START', details: 'Running dynamic price optimization...', status: 'info' });

    // Apply demand-based adjustments
    let adjusted = 0;
    optimizableItems.forEach(p => {
      adjustPrice(p.id, p.demandLevel);
      adjusted++;
    });

    await new Promise(r => setTimeout(r, 1500));
    addAgentLog({
      agent: 'pricing', action: 'OPTIMIZE_DONE',
      details: `Optimized ${adjusted} product prices based on demand signals`,
      status: 'success'
    });
    setOptimizing(false);
    toast.success(`${adjusted} prices optimized dynamically`);
  };

  const handleLaunchPromotion = () => {
    // Apply 15% discount to slow-moving items
    const slowItems = products.filter(p => p.demandLevel === 'low');
    slowItems.forEach(p => applyPromotion(p.id, 15));
    addAgentLog({
      agent: 'pricing', action: 'PROMO_LAUNCH',
      details: `Launched 15% discount campaign on ${slowItems.length} slow-moving items`,
      status: 'info'
    });
    toast.success(`Promotion applied to ${slowItems.length} items`);
  };

  const handleCompetitorCheck = async () => {
    await runAction('optimize');
  };

  const operations = [
    {
      id: 'optimize',
      label: 'Optimize Prices',
      desc: 'Dynamic pricing adjustment',
      icon: DollarSign,
      color: 'text-primary border-primary/50 hover:bg-primary/10',
      onClick: handleOptimizePrices,
      loading: optimizing,
    },
    {
      id: 'promo',
      label: 'Launch Promo',
      desc: 'Apply discount campaign',
      icon: Tag,
      color: 'text-accent border-accent/50 hover:bg-accent/10',
      onClick: handleLaunchPromotion,
    },
    {
      id: 'competitor',
      label: 'AI Price Check',
      desc: 'Market comparison via AI',
      icon: BarChart3,
      color: 'text-warning border-warning/50 hover:bg-warning/10',
      onClick: handleCompetitorCheck,
      loading: loading === 'optimize',
    },
    {
      id: 'margin',
      label: 'Margin Monitor',
      desc: 'Highlight risky pricing',
      icon: PieChart,
      color: 'text-destructive border-destructive/50 hover:bg-destructive/10',
      onClick: () => setActivePanel(activePanel === 'margin' ? null : 'margin'),
      badge: lowMarginItems.length,
    },
  ];

  return (
    <div className="glow-card p-4 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h2 className="font-display text-sm tracking-wider text-accent flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          PRICING & SALES
        </h2>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            <div className="grid grid-cols-2 gap-1.5">
              {operations.map(op => (
                <Button
                  key={op.id}
                  variant="outline"
                  size="sm"
                  disabled={op.loading}
                  onClick={op.onClick}
                  className={cn("h-auto py-2 flex-col items-start text-left text-[10px] font-display tracking-wider relative", op.color)}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    {op.loading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <op.icon className="h-3 w-3" />
                    )}
                    <span className="font-semibold">{op.label}</span>
                    {op.badge != null && op.badge > 0 && (
                      <span className="ml-auto text-[9px] bg-warning/20 text-warning px-1.5 rounded-full font-bold">
                        {op.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-0.5">{op.desc}</span>
                </Button>
              ))}
            </div>

            {/* Margin Monitor Panel */}
            <AnimatePresence>
              {activePanel === 'margin' && lowMarginItems.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-1">
                      <p className="font-display text-[10px] text-destructive uppercase tracking-wider">Low Margin Items</p>
                      {lowMarginItems.map(item => {
                        const margin = ((item.currentPrice - item.basePrice * 0.6) / item.currentPrice) * 100;
                        return (
                          <div key={item.id} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1.5 text-[11px]">
                            <span className="text-foreground/80">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">${item.currentPrice.toFixed(2)}</span>
                              <span className={cn(
                                "font-bold text-[10px] px-1.5 rounded",
                                margin < 10 ? 'status-critical' : 'status-warning'
                              )}>
                                {margin.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
