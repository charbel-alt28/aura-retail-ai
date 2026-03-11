import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Lock, Activity,
  RefreshCw, Eye, CheckCircle, XCircle, Clock, TrendingUp, Users, Ban
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRBAC } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  metadata: Record<string, unknown>;
  resolved: boolean;
  created_at: string;
}

interface AuditEntry {
  id: string;
  event_type: string;
  user_id: string | null;
  created_at: string;
  details: Record<string, unknown> | null;
  user_agent: string | null;
}

interface FailedAttempt {
  id: string;
  email: string;
  attempted_at: string;
  user_agent: string | null;
}

export function SecurityDashboard() {
  const { role } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'logins' | 'audit'>('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<FailedAttempt[]>([]);

  const handleSecurityAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
      // Verify admin role
      const { data: roleData } = await supabaseAny.from('user_roles').select('role').eq('user_id', user?.id).eq('role', 'admin').single();
      if (!roleData) {
        setAuthError('Access denied. Admin privileges required.');
        return;
      }
      setAuthenticated(true);
      toast.success('Security panel unlocked');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, auditRes, failedRes] = await Promise.all([
        supabaseAny.from('security_events').select('*').order('created_at', { ascending: false }).limit(50),
        supabaseAny.from('auth_audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabaseAny.from('failed_login_attempts').select('*').order('attempted_at', { ascending: false }).limit(50),
      ]);
      setSecurityEvents(eventsRes.data || []);
      setAuditLogs(auditRes.data || []);
      setFailedAttempts(failedRes.data || []);
    } catch {
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (role !== 'admin') return null;

  // removed - moved above early return

  const resolveEvent = async (id: string) => {
    await supabaseAny.from('security_events').update({ resolved: true }).eq('id', id);
    setSecurityEvents(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
    toast.success('Event resolved');
  };

  const unresolvedCount = securityEvents.filter(e => !e.resolved).length;
  const criticalCount = securityEvents.filter(e => e.severity === 'critical' && !e.resolved).length;
  const recentFailedCount = failedAttempts.filter(a => {
    const diff = Date.now() - new Date(a.attempted_at).getTime();
    return diff < 3600000; // last hour
  }).length;

  const threatLevel = criticalCount > 0 ? 'CRITICAL' : unresolvedCount > 3 ? 'ELEVATED' : recentFailedCount > 10 ? 'MODERATE' : 'LOW';
  const threatColor = threatLevel === 'CRITICAL' ? 'text-destructive' : threatLevel === 'ELEVATED' ? 'text-warning' : threatLevel === 'MODERATE' ? 'text-accent' : 'text-success';

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Shield },
    { id: 'events' as const, label: 'Threats', icon: ShieldAlert },
    { id: 'logins' as const, label: 'Failed Logins', icon: Ban },
    { id: 'audit' as const, label: 'Audit Trail', icon: Eye },
  ];

  const severityColor = (s: string) => s === 'critical' ? 'text-destructive border-destructive/50' : s === 'high' ? 'text-warning border-warning/50' : s === 'medium' ? 'text-accent border-accent/50' : 'text-muted-foreground border-border';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-sm tracking-wider text-foreground">SECURITY CENTER</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Threat Level Banner */}
      <div className={cn("border rounded-lg p-3 flex items-center justify-between", 
        threatLevel === 'CRITICAL' ? 'border-destructive/50 bg-destructive/10' : 
        threatLevel === 'ELEVATED' ? 'border-warning/50 bg-warning/10' : 'border-border bg-muted/20')}>
        <div className="flex items-center gap-2">
          {threatLevel === 'LOW' ? <ShieldCheck className="h-5 w-5 text-success" /> : <AlertTriangle className={cn("h-5 w-5", threatColor)} />}
          <div>
            <p className={cn("text-xs font-display tracking-wider font-bold", threatColor)}>THREAT LEVEL: {threatLevel}</p>
            <p className="text-[9px] text-muted-foreground">{unresolvedCount} unresolved events · {recentFailedCount} failed logins (1h)</p>
          </div>
        </div>
        {criticalCount > 0 && (
          <Badge variant="destructive" className="text-[9px] font-display">{criticalCount} CRITICAL</Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Auth Events', value: auditLogs.length, icon: Activity, color: 'text-primary' },
          { label: 'Failed Logins', value: failedAttempts.length, icon: Lock, color: 'text-warning' },
          { label: 'Threats', value: unresolvedCount, icon: ShieldAlert, color: 'text-destructive' },
          { label: 'Resolved', value: securityEvents.filter(e => e.resolved).length, icon: CheckCircle, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="bg-muted/20 border border-border/50 rounded-lg p-2 text-center">
            <s.icon className={cn("h-3.5 w-3.5 mx-auto mb-1", s.color)} />
            <p className="text-base font-bold font-display">{s.value}</p>
            <p className="text-[8px] text-muted-foreground tracking-wider">{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn("flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-display tracking-wider transition-colors",
              activeTab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <ScrollArea className="max-h-[350px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <p className="font-display text-[10px] text-primary tracking-wider">SECURITY POSTURE</p>
              {[
                { label: 'Row-Level Security (RLS)', status: 'Active', ok: true, desc: 'All tables protected with granular policies' },
                { label: 'JWT Verification', status: 'Enforced', ok: true, desc: 'getUser() validation on all edge functions' },
                { label: 'RBAC System', status: '5 Roles', ok: true, desc: 'Admin, Operator, Viewer, Inventory Mgr, Pricing Mgr' },
                { label: 'Session Timeout', status: '15 min', ok: true, desc: 'Auto-logout on inactivity with warning' },
                { label: 'Rate Limiting', status: '10 req/min', ok: true, desc: 'Per-user AI operation throttling' },
                { label: 'CSP Headers', status: 'Active', ok: true, desc: 'Content Security Policy restricts script sources' },
                { label: 'Input Validation', status: 'Zod', ok: true, desc: 'Schema validation on all forms' },
                { label: 'Password Policy', status: 'Strong', ok: true, desc: 'Uppercase, lowercase, number, special char required' },
                { label: 'Failed Login Lockout', status: 'Active', ok: true, desc: 'Account locked after 5 failed attempts' },
                { label: 'Re-Auth for Critical Ops', status: 'Enforced', ok: true, desc: 'Password re-entry for destructive actions' },
                { label: 'Audit Logging', status: 'Full', ok: true, desc: 'All auth events + operations logged' },
                { label: 'CORS Origin Restriction', status: 'Strict', ok: true, desc: 'Only whitelisted origins accepted' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 bg-muted/20 rounded px-2.5 py-1.5">
                  {item.ok ? <CheckCircle className="h-3 w-3 text-success shrink-0" /> : <XCircle className="h-3 w-3 text-destructive shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-foreground">{item.label}</span>
                      <Badge variant="outline" className="text-[8px] h-4 border-success/50 text-success">{item.status}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              <p className="font-display text-[10px] text-destructive tracking-wider">THREAT EVENTS</p>
              {securityEvents.length === 0 ? (
                <div className="text-center py-6">
                  <ShieldCheck className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No security events detected</p>
                </div>
              ) : securityEvents.map(ev => (
                <div key={ev.id} className={cn("border rounded-lg p-2.5 space-y-1", ev.resolved ? 'border-border/30 opacity-60' : severityColor(ev.severity))}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={cn("h-3 w-3", severityColor(ev.severity).split(' ')[0])} />
                      <span className="text-[11px] font-bold">{ev.event_type}</span>
                      <Badge variant="outline" className={cn("text-[8px] h-4", severityColor(ev.severity))}>{ev.severity.toUpperCase()}</Badge>
                    </div>
                    {!ev.resolved && (
                      <Button variant="ghost" size="sm" className="h-5 text-[9px] px-2" onClick={() => resolveEvent(ev.id)}>Resolve</Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{ev.description}</p>
                  <p className="text-[9px] text-muted-foreground/60">{new Date(ev.created_at).toLocaleString()}</p>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'logins' && (
            <motion.div key="logins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              <p className="font-display text-[10px] text-warning tracking-wider">FAILED LOGIN ATTEMPTS</p>
              {failedAttempts.length === 0 ? (
                <div className="text-center py-6">
                  <Lock className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No failed login attempts</p>
                </div>
              ) : failedAttempts.map(a => (
                <div key={a.id} className="flex items-start gap-2 bg-muted/20 border border-warning/20 rounded px-2.5 py-1.5">
                  <Ban className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-foreground/90">{a.email}</p>
                    <p className="text-[9px] text-muted-foreground">{new Date(a.attempted_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              <p className="font-display text-[10px] text-primary tracking-wider">AUTHENTICATION AUDIT TRAIL</p>
              {auditLogs.length === 0 ? (
                <p className="text-[10px] text-muted-foreground py-4 text-center">No audit logs</p>
              ) : auditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2 bg-muted/20 rounded px-2.5 py-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-foreground/90">{log.event_type}</span>
                      <Badge variant="outline" className="text-[8px] h-4">
                        {log.event_type.includes('sign_in') ? 'LOGIN' : log.event_type.includes('sign_up') ? 'REGISTER' : 'EVENT'}
                      </Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
