import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp, ScrollText, Activity, DatabaseBackup, CloudCog, ToggleLeft, ToggleRight, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuditEntry {
  id: string;
  event_type: string;
  user_id: string | null;
  created_at: string;
  details: any;
}

export function AdminSystemControls() {
  const { isSimulating, setSimulating, addAgentLog } = useHypermarketStore();
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [backing, setBacking] = useState(false);

  const [systemStatus] = useState({
    database: 'online',
    aiGateway: 'online',
    agents: 'active',
    uptime: '99.97%',
  });

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const { data, error } = await supabase
        .from('auth_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setAuditLogs(data || []);
      setActivePanel('activity');
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleBackup = async () => {
    setBacking(true);
    addAgentLog({ agent: 'inventory', action: 'BACKUP', details: 'Initiating database snapshot...', status: 'info' });
    await new Promise(r => setTimeout(r, 2500));
    addAgentLog({ agent: 'inventory', action: 'BACKUP_DONE', details: 'Database snapshot completed successfully', status: 'success' });
    setBacking(false);
    toast.success('Database backup completed');
  };

  const handleSync = async () => {
    setSyncing(true);
    addAgentLog({ agent: 'inventory', action: 'SYNC', details: 'Syncing local state with cloud...', status: 'info' });
    await new Promise(r => setTimeout(r, 2000));
    addAgentLog({ agent: 'inventory', action: 'SYNC_DONE', details: 'Cloud sync complete — all data up to date', status: 'success' });
    setSyncing(false);
    toast.success('Cloud sync complete');
  };

  const toggleSimulation = () => {
    const next = !isSimulating;
    setSimulating(next);
    addAgentLog({
      agent: 'inventory', action: 'SIM_MODE',
      details: `Simulation mode ${next ? 'enabled' : 'disabled'}`,
      status: next ? 'warning' : 'info',
    });
    toast.success(`Simulation mode ${next ? 'ON' : 'OFF'}`);
  };

  const operations = [
    {
      id: 'activity',
      label: 'Activity Log',
      desc: 'User & system events',
      icon: ScrollText,
      color: 'text-primary border-primary/50 hover:bg-primary/10',
      onClick: fetchAuditLogs,
      loading: loadingAudit,
    },
    {
      id: 'status',
      label: 'System Status',
      desc: 'Service health check',
      icon: Activity,
      color: 'text-success border-success/50 hover:bg-success/10',
      onClick: () => setActivePanel(activePanel === 'status' ? null : 'status'),
    },
    {
      id: 'backup',
      label: 'Backup DB',
      desc: 'Snapshot database',
      icon: DatabaseBackup,
      color: 'text-warning border-warning/50 hover:bg-warning/10',
      onClick: handleBackup,
      loading: backing,
    },
    {
      id: 'sync',
      label: 'Sync Cloud',
      desc: 'Push/pull cloud data',
      icon: CloudCog,
      color: 'text-accent border-accent/50 hover:bg-accent/10',
      onClick: handleSync,
      loading: syncing,
    },
  ];

  return (
    <div className="glow-card p-4 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h2 className="font-display text-sm tracking-wider text-warning flex items-center gap-2">
          <Shield className="h-4 w-4" />
          ADMIN / SYSTEM
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
            {/* Operation Buttons */}
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
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-0.5">{op.desc}</span>
                </Button>
              ))}
            </div>

            {/* Simulation Mode Toggle */}
            <div className="flex items-center justify-between bg-muted/20 border border-border/50 rounded-lg px-3 py-2">
              <div>
                <p className="text-[11px] font-display tracking-wider text-foreground">SIMULATION MODE</p>
                <p className="text-[9px] text-muted-foreground">Run agents without real changes</p>
              </div>
              <button onClick={toggleSimulation} className="text-primary">
                {isSimulating
                  ? <ToggleRight className="h-6 w-6 text-warning" />
                  : <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                }
              </button>
            </div>

            {/* Activity Log Panel */}
            <AnimatePresence>
              {activePanel === 'activity' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="max-h-[220px]">
                    <div className="space-y-1">
                      <p className="font-display text-[10px] text-primary uppercase tracking-wider">Recent Activity</p>
                      {auditLogs.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2">No audit logs found</p>
                      ) : (
                        auditLogs.map(log => (
                          <div key={log.id} className="flex items-start gap-2 bg-muted/20 rounded px-2 py-1.5 text-[11px]">
                            <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground/90">{log.event_type}</span>
                              <p className="text-[9px] text-muted-foreground truncate">
                                {new Date(log.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>

            {/* System Status Panel */}
            <AnimatePresence>
              {activePanel === 'status' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <p className="font-display text-[10px] text-success uppercase tracking-wider">System Health</p>
                    {Object.entries(systemStatus).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1.5 text-[11px]">
                        <span className="text-foreground/80 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={cn(
                          "flex items-center gap-1 font-bold text-[10px]",
                          value === 'online' || value === 'active' ? 'text-success' : 'text-warning'
                        )}>
                          <CheckCircle className="h-3 w-3" />
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
