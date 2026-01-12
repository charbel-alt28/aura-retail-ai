import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useHypermarketStore, Product } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { reorderProduct, adjustPrice } = useHypermarketStore();
  
  const stockStatus = product.stock < product.reorderLevel ? 'critical' : 
                      product.stock < product.reorderLevel * 1.5 ? 'warning' : 'good';
  
  const priceChange = product.currentPrice !== product.basePrice;
  const priceUp = product.currentPrice > product.basePrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glow-card p-4 group",
        stockStatus === 'critical' && "border-destructive/50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm">{product.name}</h3>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
          stockStatus === 'critical' && "status-critical",
          stockStatus === 'warning' && "status-warning",
          stockStatus === 'good' && "status-success"
        )}>
          {stockStatus}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Stock Level</p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-display font-bold",
              stockStatus === 'critical' && "text-destructive neon-text-accent",
              stockStatus === 'warning' && "text-warning",
              stockStatus === 'good' && "text-success"
            )}>
              {product.stock}
            </span>
            <span className="text-xs text-muted-foreground">
              / {product.reorderLevel} min
            </span>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">Price</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-display font-bold text-primary">
              ${product.currentPrice.toFixed(2)}
            </span>
            {priceChange && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "flex items-center",
                  priceUp ? "text-success" : "text-accent"
                )}
              >
                {priceUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stock bar */}
      <div className="mb-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              stockStatus === 'critical' && "bg-destructive",
              stockStatus === 'warning' && "bg-warning",
              stockStatus === 'good' && "bg-success"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((product.stock / (product.reorderLevel * 3)) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>Demand: <span className={cn(
          "font-semibold",
          product.demandLevel === 'high' && "text-success",
          product.demandLevel === 'low' && "text-warning",
          product.demandLevel === 'medium' && "text-primary"
        )}>{product.demandLevel}</span></span>
        <span>Forecast: {product.demandForecast}/day</span>
      </div>
      
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {stockStatus !== 'good' && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => reorderProduct(product.id, product.reorderLevel * 2)}
          >
            Reorder
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs border-accent/50 text-accent hover:bg-accent/10"
          onClick={() => adjustPrice(product.id, product.demandLevel)}
        >
          Optimize Price
        </Button>
      </div>
    </motion.div>
  );
}

export function InventoryDashboard() {
  const { products } = useHypermarketStore();
  
  const criticalCount = products.filter(p => p.stock < p.reorderLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.currentPrice), 0);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-primary flex items-center gap-2">
          <Package className="h-5 w-5" />
          INVENTORY MONITOR
        </h2>
        <div className="flex items-center gap-4 text-sm">
          {criticalCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-destructive"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{criticalCount} Critical</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 text-success">
            <CheckCircle className="h-4 w-4" />
            <span>{products.length - criticalCount} OK</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="metric-card">
          <p className="text-xs text-muted-foreground mb-1">Total SKUs</p>
          <p className="text-2xl font-display font-bold text-foreground">{products.length}</p>
        </div>
        <div className="metric-card accent">
          <p className="text-xs text-muted-foreground mb-1">Inventory Value</p>
          <p className="text-2xl font-display font-bold text-accent">${totalValue.toFixed(0)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
