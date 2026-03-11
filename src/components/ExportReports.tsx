import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHypermarketStore } from '@/lib/store';
import { useWastageLogs } from '@/hooks/useWastageLogs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRBAC } from '@/hooks/useRBAC';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const escape = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportReports() {
  const { products } = useHypermarketStore();
  const { data: wastageLogs } = useWastageLogs();
  const { canAccess } = useRBAC();
  const [exporting, setExporting] = useState<string | null>(null);

  const exportInventory = () => {
    setExporting('inventory');
    try {
      const headers = ['Name', 'Category', 'Stock', 'Reorder Level', 'Base Price', 'Current Price', 'Demand'];
      const rows = products.map(p => [
        p.name, p.category, String(p.stock), String(p.reorderLevel),
        p.basePrice.toFixed(2), p.currentPrice.toFixed(2), p.demandLevel,
      ]);
      downloadCSV(`inventory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      toast.success('Inventory exported successfully');
    } finally {
      setExporting(null);
    }
  };

  const exportWastage = () => {
    if (!wastageLogs?.length) {
      toast.info('No wastage logs to export');
      return;
    }
    setExporting('wastage');
    try {
      const headers = ['Product', 'SKU', 'Category', 'Qty Discarded', 'Unit Value', 'Total Loss', 'Reason', 'Date'];
      const rows = wastageLogs.map(l => [
        l.product_name, l.sku, l.category || '', String(l.quantity_discarded),
        String(l.unit_value), String(l.total_value_lost), l.reason, l.date_discarded,
      ]);
      downloadCSV(`wastage_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      toast.success('Wastage logs exported successfully');
    } finally {
      setExporting(null);
    }
  };

  const exportAuditLogs = async () => {
    setExporting('audit');
    try {
      const { data, error } = await supabaseAny
        .from('auth_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      if (!data?.length) {
        toast.info('No audit logs to export');
        return;
      }
      const headers = ['Event Type', 'User ID', 'IP Address', 'User Agent', 'Created At', 'Details'];
      const rows = data.map((l: Record<string, unknown>) => [
        String(l.event_type), String(l.user_id || ''), String(l.ip_address || ''),
        String(l.user_agent || ''), String(l.created_at), JSON.stringify(l.details || {}),
      ]);
      downloadCSV(`audit_logs_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      toast.success('Audit logs exported successfully');
    } catch (err) {
      toast.error('Failed to export audit logs');
    } finally {
      setExporting(null);
    }
  };

  const exports = [
    { id: 'inventory', label: 'Inventory Report', desc: `${products.length} products`, onClick: exportInventory, perm: 'view_inventory' as const },
    { id: 'wastage', label: 'Wastage Report', desc: `${wastageLogs?.length ?? 0} logs`, onClick: exportWastage, perm: 'view_inventory' as const },
    { id: 'audit', label: 'Audit Trail', desc: 'Auth events', onClick: exportAuditLogs, perm: 'view_audit_logs' as const },
  ];

  return (
    <div className="glow-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs tracking-wider text-primary">EXPORT REPORTS</h3>
      </div>
      <div className="space-y-2">
        {exports.map(exp => (
          canAccess(exp.perm) && (
            <Button
              key={exp.id}
              variant="outline"
              size="sm"
              className="w-full justify-between h-9 text-xs border-border/50 hover:border-primary/50"
              onClick={exp.onClick}
              disabled={exporting !== null}
            >
              <span className="flex items-center gap-2">
                {exporting === exp.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                {exp.label}
              </span>
              <Badge variant="outline" className="text-[9px] border-border/30">
                {exp.desc}
              </Badge>
            </Button>
          )
        ))}
      </div>
    </div>
  );
}
