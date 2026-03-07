import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Skull, Clock, DollarSign, Trash2, ClipboardList, TrendingDown, ChevronDown, ChevronUp, Package, CalendarX } from 'lucide-react';
import { useExpiryTracking, ExpiryItem } from '@/hooks/useExpiryTracking';
import { useWastageLogs, useWastageStats, useCreateWastageLog } from '@/hooks/useWastageLogs';
import { useHypermarketStore } from '@/lib/store';
import { productMetadata } from '@/lib/productMetadata';
import { productImages } from '@/lib/productData';
import { useRBAC } from '@/hooks/useRBAC';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: ExpiryItem['status'] }) {
  const map = {
    expired: { label: 'EXPIRED', class: 'bg-destructive/20 text-destructive border-destructive/30' },
    critical: { label: '≤2 DAYS', class: 'bg-destructive/15 text-destructive border-destructive/20' },
    warning: { label: '≤3 DAYS', class: 'bg-warning/15 text-warning border-warning/20' },
    ok: { label: 'OK', class: 'bg-success/15 text-success border-success/20' },
  };
  const s = map[status];
  return <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border", s.class)}>{s.label}</span>;
}

function ExpiryItemRow({ item, onDiscard }: { item: ExpiryItem; onDiscard: (item: ExpiryItem) => void }) {
  const img = productImages[item.id];
  return (
    <div className={cn(
      "flex items-center gap-2 bg-muted/20 rounded-lg px-2.5 py-2 border",
      item.status === 'expired' ? 'border-destructive/30' : item.status === 'critical' ? 'border-destructive/15' : 'border-warning/15'
    )}>
      <div className="w-8 h-8 rounded overflow-hidden bg-muted/30 flex-shrink-0">
        {img ? <img src={img} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-1.5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-foreground truncate">{item.name}</span>
          <StatusBadge status={item.status} />
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
          <span>{item.stock} units</span>
          <span>•</span>
          <span>${item.totalValueAtRisk.toFixed(2)} at risk</span>
          <span>•</span>
          <span>{item.daysUntilExpiry <= 0 ? 'Expired' : `${item.daysUntilExpiry}d left`}</span>
        </div>
        <p className="text-[8px] text-accent mt-0.5 italic">{item.recommendedAction}</p>
      </div>
      <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => onDiscard(item)}>
        <Trash2 className="h-3 w-3 mr-1" /> Log
      </Button>
    </div>
  );
}

function DiscardDialog({ item, open, onOpenChange }: { item: ExpiryItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('expired');
  const [notes, setNotes] = useState('');
  const createLog = useCreateWastageLog();
  const { updateStock } = useHypermarketStore();

  const handleSubmit = () => {
    if (!item) return;
    const qty = parseInt(quantity) || item.stock;
    const meta = productMetadata[item.id];

    createLog.mutate({
      product_id: item.id,
      product_name: item.name,
      sku: `SKU-${item.id.padStart(3, '0')}`,
      category: item.category,
      quantity_discarded: qty,
      unit_value: item.currentPrice,
      total_value_lost: qty * item.currentPrice,
      expiry_date: meta?.doe || null,
      reason,
      notes: notes || null,
    });

    // Update stock in frontend store
    const newStock = Math.max(0, item.stock - qty);
    updateStock(item.id, newStock);

    toast.success(`Logged ${qty} units of ${item.name} as ${reason}`);
    onOpenChange(false);
    setQuantity('');
    setNotes('');
    setReason('expired');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-sm text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Log Wastage
          </DialogTitle>
          <DialogDescription className="text-xs">Record discarded inventory for {item?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Quantity to discard</label>
            <Input type="number" min="1" max={item?.stock || 999} placeholder={`Max: ${item?.stock}`} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-8 text-xs bg-input border-border mt-1" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-8 text-xs bg-input border-border mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="unsellable">Unsellable</SelectItem>
                <SelectItem value="recalled">Recalled</SelectItem>
                <SelectItem value="quality_issue">Quality Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
            <Input placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} className="h-8 text-xs bg-input border-border mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
          <Button size="sm" onClick={handleSubmit} className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={createLog.isPending}>
            {createLog.isPending ? 'Logging...' : 'Confirm Discard'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpiryWastageDashboard() {
  const stats = useExpiryTracking();
  const { data: wastageLogs, isLoading: logsLoading } = useWastageLogs();
  const { data: wastageStats } = useWastageStats();
  const { hasPermission } = useRBAC();
  const [activeView, setActiveView] = useState<'alerts' | 'log' | 'report'>('alerts');
  const [discardItem, setDiscardItem] = useState<ExpiryItem | null>(null);
  const [logExpanded, setLogExpanded] = useState(true);

  const canModify = hasPermission('modify_stock');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-destructive flex items-center gap-2">
          <CalendarX className="h-5 w-5" />
          EXPIRY & WASTAGE
        </h2>
        <div className="flex items-center gap-3 text-xs">
          {stats.totalAlreadyExpired > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-destructive">
              <Skull className="h-3.5 w-3.5" />
              <span>{stats.totalAlreadyExpired} Expired</span>
            </motion.div>
          )}
          {stats.totalExpiringWithin3Days > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{stats.totalExpiringWithin3Days} Expiring</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="metric-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Skull className="h-3 w-3 text-destructive" />
            <p className="text-[10px] text-muted-foreground">Already Expired</p>
          </div>
          <p className="text-xl font-display font-bold text-destructive">{stats.unitsAlreadyExpired}</p>
          <p className="text-[9px] text-destructive/70">{stats.totalAlreadyExpired} SKUs • ${stats.valueAlreadyLost.toFixed(0)} lost</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3 text-warning" />
            <p className="text-[10px] text-muted-foreground">Expiring Soon</p>
          </div>
          <p className="text-xl font-display font-bold text-warning">{stats.unitsExpiringWithin3Days}</p>
          <p className="text-[9px] text-warning/70">{stats.totalExpiringWithin3Days} SKUs • ${stats.valueAtRisk.toFixed(0)} at risk</p>
        </div>
        <div className="metric-card accent">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-3 w-3 text-accent" />
            <p className="text-[10px] text-muted-foreground">Total Value at Risk</p>
          </div>
          <p className="text-xl font-display font-bold text-accent">${(stats.valueAtRisk + stats.valueAlreadyLost).toFixed(0)}</p>
          <p className="text-[9px] text-accent/70">Combined exposure</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Total Waste Logged</p>
          </div>
          <p className="text-xl font-display font-bold text-foreground">{wastageStats?.totalItems ?? 0}</p>
          <p className="text-[9px] text-muted-foreground/70">${(wastageStats?.totalValue ?? 0).toFixed(0)} total loss</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1.5">
        {(['alerts', 'log', 'report'] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)} className={cn(
            "px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all border",
            activeView === v ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
          )}>
            {v === 'alerts' ? `Alerts (${stats.allTrackedItems.length})` : v === 'log' ? `Wastage Log (${wastageStats?.totalEntries ?? 0})` : 'Report'}
          </button>
        ))}
      </div>

      {/* Alerts View */}
      {activeView === 'alerts' && (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-1.5">
            {stats.allTrackedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No expiry alerts — all products within safe dates
              </div>
            ) : (
              stats.allTrackedItems.map(item => (
                <ExpiryItemRow key={item.id} item={item} onDiscard={canModify ? setDiscardItem : () => toast.error('Insufficient permissions')} />
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Wastage Log View */}
      {activeView === 'log' && (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-1">
            {logsLoading ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Loading wastage records...</div>
            ) : !wastageLogs?.length ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No wastage records yet
              </div>
            ) : (
              wastageLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-2.5 py-2 border border-border/30 text-[11px]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{log.product_name}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                        log.reason === 'expired' ? 'bg-destructive/15 text-destructive border-destructive/20' :
                        log.reason === 'damaged' ? 'bg-warning/15 text-warning border-warning/20' :
                        'bg-muted text-muted-foreground border-border'
                      )}>{log.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                      <span>{log.quantity_discarded} units</span>
                      <span>•</span>
                      <span>${Number(log.total_value_lost).toFixed(2)} loss</span>
                      <span>•</span>
                      <span>{new Date(log.date_discarded).toLocaleDateString()}</span>
                    </div>
                    {log.notes && <p className="text-[8px] text-muted-foreground/70 mt-0.5 italic">{log.notes}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Report View */}
      {activeView === 'report' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Wastage by Reason</p>
              {wastageStats?.byReason && Object.entries(wastageStats.byReason).length > 0 ? (
                Object.entries(wastageStats.byReason).map(([reason, data]) => (
                  <div key={reason} className="flex justify-between items-center text-[11px] py-1 border-b border-border/20 last:border-0">
                    <span className="text-foreground capitalize">{reason.replace('_', ' ')}</span>
                    <div className="text-right">
                      <span className="text-muted-foreground">{data.count} units</span>
                      <span className="text-destructive ml-2 font-semibold">${data.value.toFixed(0)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground/50 italic">No data yet</p>
              )}
            </div>
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">7-Day Summary</p>
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] text-muted-foreground">Items Discarded (7d)</p>
                  <p className="text-lg font-display font-bold text-warning">{wastageStats?.recentItems ?? 0}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Value Lost (7d)</p>
                  <p className="text-lg font-display font-bold text-destructive">${(wastageStats?.recentValue ?? 0).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">All-Time Loss</p>
                  <p className="text-lg font-display font-bold text-accent">${(wastageStats?.totalValue ?? 0).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current expiry risk summary */}
          <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Active Expiry Risk</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-display font-bold text-destructive">{stats.totalAlreadyExpired}</p>
                <p className="text-[9px] text-muted-foreground">Expired SKUs</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold text-warning">{stats.totalExpiringWithin3Days}</p>
                <p className="text-[9px] text-muted-foreground">Expiring ≤3d</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold text-accent">${(stats.valueAtRisk + stats.valueAlreadyLost).toFixed(0)}</p>
                <p className="text-[9px] text-muted-foreground">Total Exposure</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <DiscardDialog item={discardItem} open={!!discardItem} onOpenChange={(open) => { if (!open) setDiscardItem(null); }} />
    </div>
  );
}
