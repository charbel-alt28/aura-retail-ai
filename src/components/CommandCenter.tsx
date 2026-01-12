import { motion } from 'framer-motion';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CommandCenter() {
  const { isSimulating, runDemoScenario, products } = useHypermarketStore();
  
  const criticalItems = products.filter(p => p.stock < p.reorderLevel).length;
  const optimizableItems = products.filter(p => p.currentPrice === p.basePrice && p.demandLevel !== 'medium').length;
  
  return (
    <div className="glow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
          <Zap className="h-4 w-4" />
          COMMAND CENTER
        </h2>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={() => runDemoScenario()}
          disabled={isSimulating}
          className={cn(
            "w-full h-12 font-display text-sm tracking-wider relative overflow-hidden",
            "bg-gradient-to-r from-primary via-primary to-accent",
            "hover:from-primary/90 hover:via-primary/90 hover:to-accent/90",
            "disabled:opacity-50"
          )}
        >
          {isSimulating ? (
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <RotateCcw className="h-4 w-4 animate-spin" />
              RUNNING SIMULATION...
            </motion.div>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              RUN DEMO SCENARIO
            </span>
          )}
          
          {/* Animated background */}
          {isSimulating && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          )}
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-2xl font-display font-bold text-destructive">{criticalItems}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical Stock</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-2xl font-display font-bold text-accent">{optimizableItems}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price Optimizable</p>
          </div>
        </div>
        
        <p className="text-[10px] text-center text-muted-foreground">
          Demo will: scan inventory → restock critical items → optimize pricing → handle queries
        </p>
      </div>
    </div>
  );
}
