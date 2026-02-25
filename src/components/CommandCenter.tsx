import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Zap, Brain, TrendingUp, ShieldAlert, Lightbulb, ToggleLeft, ToggleRight, RefreshCw, AlertCircle, Bot, BarChart3, FileText } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { useAIAutomation, AIAction } from '@/hooks/useAIAutomation';
import { AIResultsPanel } from '@/components/AIResultsPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CommandCenter() {
  const { isSimulating, runDemoScenario, products } = useHypermarketStore();
  const { loading, results, setResults, runAction } = useAIAutomation();
  const [autoRestock, setAutoRestock] = useState(false);
  
  const criticalItems = products.filter(p => p.stock < p.reorderLevel).length;
  const optimizableItems = products.filter(p => p.currentPrice === p.basePrice && p.demandLevel !== 'medium').length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.currentPrice * p.demandForecast), 0);
  const stockHealth = Math.round(((products.length - criticalItems) / products.length) * 100);

  const aiButtons: { action: AIAction; label: string; icon: React.ReactNode; color: string }[] = [
    { action: 'optimize', label: 'AI OPTIMIZE', icon: <Brain className="h-3.5 w-3.5" />, color: 'border-primary/50 text-primary hover:bg-primary/10' },
    { action: 'forecast', label: 'FORECAST', icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'border-accent/50 text-accent hover:bg-accent/10' },
    { action: 'anomaly', label: 'ANOMALIES', icon: <ShieldAlert className="h-3.5 w-3.5" />, color: 'border-destructive/50 text-destructive hover:bg-destructive/10' },
    { action: 'recommendations', label: 'RECOMMEND', icon: <Lightbulb className="h-3.5 w-3.5" />, color: 'border-warning/50 text-warning hover:bg-warning/10' },
  ];
  
  return (
    <div className="glow-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
          <Zap className="h-4 w-4" />
          COMMAND CENTER
        </h2>
      </div>
      
      {/* Run Demo */}
      <Button
        onClick={() => runDemoScenario()}
        disabled={isSimulating}
        className={cn(
          "w-full h-10 font-display text-xs tracking-wider relative overflow-hidden",
          "bg-gradient-to-r from-primary via-primary to-accent",
          "hover:from-primary/90 hover:via-primary/90 hover:to-accent/90",
          "disabled:opacity-50"
        )}
      >
        {isSimulating ? (
          <motion.div className="flex items-center gap-2" animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <RotateCcw className="h-3.5 w-3.5 animate-spin" />
            RUNNING...
          </motion.div>
        ) : (
          <span className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5" />
            RUN DEMO SCENARIO
          </span>
        )}
        {isSimulating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        )}
      </Button>

      {/* AI Controls */}
      <div>
        <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">AI & Automation</p>
        <div className="grid grid-cols-2 gap-1.5">
          {aiButtons.map(({ action, label, icon, color }) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              disabled={loading !== null}
              onClick={() => runAction(action)}
              className={cn("h-8 text-[10px] font-display tracking-wider", color)}
            >
              {loading === action ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <RefreshCw className="h-3 w-3" />
                </motion.div>
              ) : icon}
              <span className="ml-1">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Auto-Restock Toggle */}
      <div className="flex items-center justify-between bg-muted/20 border border-border/50 rounded-lg px-3 py-2">
        <div>
          <p className="text-[11px] font-display tracking-wider text-foreground">AUTO-RESTOCK</p>
          <p className="text-[9px] text-muted-foreground">Automatic purchasing</p>
        </div>
        <button 
          onClick={() => { 
            setAutoRestock(!autoRestock); 
            toast.success(autoRestock ? 'Auto-restock disabled' : 'Auto-restock enabled');
          }}
          className="text-primary"
        >
          {autoRestock ? <ToggleRight className="h-6 w-6 text-success" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
        </button>
      </div>

      {/* Live Metrics */}
      <div>
        <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Live Metrics</p>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-lg font-display font-bold text-destructive">{criticalItems}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Critical Stock</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-lg font-display font-bold text-accent">{optimizableItems}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Optimizable</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
            <p className={cn("text-lg font-display font-bold", stockHealth >= 80 ? "text-success" : stockHealth >= 50 ? "text-warning" : "text-destructive")}>{stockHealth}%</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Stock Health</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-lg font-display font-bold text-primary">${(totalRevenue / 1000).toFixed(1)}k</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Est. Revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Quick Actions</p>
        <div className="grid grid-cols-2 gap-1">
          {[
            { label: 'Refresh', icon: <RefreshCw className="h-3 w-3" />, onClick: () => toast.info('Data refreshed') },
            { label: 'Alerts', icon: <AlertCircle className="h-3 w-3" />, onClick: () => toast.info(`${criticalItems} active alerts`) },
            { label: 'AI Chat', icon: <Bot className="h-3 w-3" />, onClick: () => runAction('recommendations') },
            { label: 'Report', icon: <FileText className="h-3 w-3" />, onClick: () => toast.info('Report generation coming soon') },
          ].map((item, i) => (
            <Button key={i} variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-foreground" onClick={item.onClick}>
              {item.icon}
              <span className="ml-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* AI Results Panel */}
      <AIResultsPanel result={results} onClose={() => setResults(null)} />
      
      <p className="text-[9px] text-center text-muted-foreground">
        Powered by Agentic AI • Real-time analysis
      </p>
    </div>
  );
}
