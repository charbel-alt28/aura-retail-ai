import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Percent, Tag } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function PricingDashboard() {
  const { products, adjustPrice, applyPromotion } = useHypermarketStore();
  
  const avgPriceChange = products.reduce((sum, p) => {
    const change = ((p.currentPrice - p.basePrice) / p.basePrice) * 100;
    return sum + change;
  }, 0) / products.length;
  
  const highDemandCount = products.filter(p => p.demandLevel === 'high').length;
  const lowDemandCount = products.filter(p => p.demandLevel === 'low').length;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-accent flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          DYNAMIC PRICING
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="metric-card accent">
          <p className="text-xs text-muted-foreground mb-1">Avg Price Δ</p>
          <div className="flex items-center gap-1">
            <p className={cn(
              "text-xl font-display font-bold",
              avgPriceChange >= 0 ? "text-success" : "text-accent"
            )}>
              {avgPriceChange >= 0 ? '+' : ''}{avgPriceChange.toFixed(1)}%
            </p>
            {avgPriceChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-accent" />
            )}
          </div>
        </div>
        <div className="metric-card success">
          <p className="text-xs text-muted-foreground mb-1">High Demand</p>
          <p className="text-xl font-display font-bold text-success">{highDemandCount}</p>
        </div>
        <div className="metric-card warning">
          <p className="text-xs text-muted-foreground mb-1">Low Demand</p>
          <p className="text-xl font-display font-bold text-warning">{lowDemandCount}</p>
        </div>
      </div>
      
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
        <AnimatePresence>
          {products.map((product, index) => {
            const priceChange = ((product.currentPrice - product.basePrice) / product.basePrice) * 100;
            const hasChanged = product.currentPrice !== product.basePrice;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glow-card p-3 flex items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm">{product.name}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                      product.demandLevel === 'high' && "bg-success/20 text-success",
                      product.demandLevel === 'low' && "bg-warning/20 text-warning",
                      product.demandLevel === 'medium' && "bg-primary/20 text-primary"
                    )}>
                      {product.demandLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Base: ${product.basePrice.toFixed(2)}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xl font-display font-bold text-primary">
                      {product.currentPrice.toFixed(2)}
                    </span>
                  </div>
                  {hasChanged && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "text-xs flex items-center gap-1 justify-end",
                        priceChange >= 0 ? "text-success" : "text-accent"
                      )}
                    >
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                      {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </motion.span>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-success hover:bg-success/10"
                    onClick={() => adjustPrice(product.id, 'high')}
                    title="Increase (High Demand)"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-warning hover:bg-warning/10"
                    onClick={() => adjustPrice(product.id, 'low')}
                    title="Decrease (Low Demand)"
                  >
                    <TrendingDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-accent hover:bg-accent/10"
                    onClick={() => applyPromotion(product.id, 10)}
                    title="Apply 10% Promo"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
