import { motion } from 'framer-motion';
import { Box, TrendingUp, Users, Activity, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHypermarketStore } from '@/lib/store';

const agents = [
  {
    id: 'inventory',
    name: 'Inventory Agent',
    icon: Box,
    description: 'Stock monitoring & demand forecasting',
    status: 'active',
    color: 'primary'
  },
  {
    id: 'pricing',
    name: 'Pricing Agent',
    icon: TrendingUp,
    description: 'Dynamic pricing optimization',
    status: 'active',
    color: 'accent'
  },
  {
    id: 'customer',
    name: 'Customer Service',
    icon: Users,
    description: 'Query handling & support',
    status: 'active',
    color: 'success'
  }
];

export function AgentStatusPanel() {
  const { isSimulating } = useHypermarketStore();
  
  return (
    <div className="glow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
          <Activity className="h-4 w-4" />
          AGENT STATUS
        </h2>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isSimulating ? "bg-primary animate-pulse" : "bg-success"
          )} />
          <span className="text-xs text-muted-foreground">
            {isSimulating ? 'Processing' : 'All Systems Online'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
              "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-primary/5",
              "group cursor-pointer"
            )}
          >
            <div className={cn(
              "relative p-2 rounded-lg",
              agent.color === 'primary' && "bg-primary/10 text-primary",
              agent.color === 'accent' && "bg-accent/10 text-accent",
              agent.color === 'success' && "bg-success/10 text-success"
            )}>
              <agent.icon className="h-5 w-5" />
              <motion.div
                className={cn(
                  "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full",
                  agent.color === 'primary' && "bg-primary",
                  agent.color === 'accent' && "bg-accent",
                  agent.color === 'success' && "bg-success"
                )}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-foreground">
                  {agent.name}
                </span>
                <Zap className={cn(
                  "h-3 w-3",
                  agent.color === 'primary' && "text-primary",
                  agent.color === 'accent' && "text-accent",
                  agent.color === 'success' && "text-success"
                )} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {agent.description}
              </p>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
