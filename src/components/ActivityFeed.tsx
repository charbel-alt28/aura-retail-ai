import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Box, TrendingUp, Users, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useHypermarketStore, AgentLog } from '@/lib/store';
import { cn } from '@/lib/utils';

const agentIcons = {
  inventory: Box,
  pricing: TrendingUp,
  customer: Users
};

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info
};

function LogEntry({ log, index }: { log: AgentLog; index: number }) {
  const AgentIcon = agentIcons[log.agent];
  const StatusIcon = statusIcons[log.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border bg-background/50",
        log.status === 'success' && "border-success/30",
        log.status === 'warning' && "border-warning/30",
        log.status === 'error' && "border-destructive/30",
        log.status === 'info' && "border-primary/30"
      )}
    >
      <div className={cn(
        "p-1.5 rounded",
        log.agent === 'inventory' && "bg-primary/10 text-primary",
        log.agent === 'pricing' && "bg-accent/10 text-accent",
        log.agent === 'customer' && "bg-success/10 text-success"
      )}>
        <AgentIcon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "font-display text-[10px] uppercase tracking-wider",
            log.agent === 'inventory' && "text-primary",
            log.agent === 'pricing' && "text-accent",
            log.agent === 'customer' && "text-success"
          )}>
            {log.agent}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            [{log.action}]
          </span>
          <StatusIcon className={cn(
            "h-3 w-3 ml-auto",
            log.status === 'success' && "text-success",
            log.status === 'warning' && "text-warning",
            log.status === 'error' && "text-destructive",
            log.status === 'info' && "text-primary"
          )} />
        </div>
        <p className="text-xs text-muted-foreground">{log.details}</p>
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          {log.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}

export function ActivityFeed() {
  const { agentLogs } = useHypermarketStore();
  
  return (
    <div className="glow-card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          AGENT ACTIVITY
        </h2>
        <span className="text-[10px] text-muted-foreground font-mono">
          {agentLogs.length} events
        </span>
      </div>
      
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 data-stream">
        {agentLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs">Run a demo scenario to see agents in action</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {agentLogs.map((log, index) => (
              <LogEntry key={log.id} log={log} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
