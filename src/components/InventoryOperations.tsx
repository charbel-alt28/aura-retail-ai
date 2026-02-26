import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, AlertTriangle, Truck, PackageX, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function InventoryOperations() {
  const { products, addAgentLog, reorderProduct } = useHypermarketStore();
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const lowStockItems = products.filter(p => p.stock < p.reorderLevel);
  const slowItems = products.filter(p => p.demandLevel === 'low' && p.stock > p.reorderLevel * 2);

  const handleScanWarehouse = async () => {
    setScanning(true);
    addAgentLog({ agent: 'inventory', action: 'WAREHOUSE_SCAN', details: 'Initiating real-time warehouse scan...', status: 'info' });
    await new Promise(r => setTimeout(r, 2000));
    addAgentLog({
      agent: 'inventory', action: 'SCAN_COMPLETE',
      details: `Scan complete: ${products.length} SKUs verified, ${lowStockItems.length} below threshold`,
      status: lowStockItems.length > 0 ? 'warning' : 'success'
    });
    setScanning(false);
    toast.success(`Warehouse scan complete — ${lowStockItems.length} items need attention`);
    setActivePanel('lowstock');
  };

  const handleAutoReorder = () => {
    let count = 0;
    lowStockItems.forEach(item => {
      reorderProduct(item.id, item.reorderLevel * 2);
      count++;
    });
    toast.success(`Purchase orders created for ${count} items`);
    setActivePanel(null);
  };

  const operations = [
    {
      id: 'scan',
      label: 'Scan Warehouse',
      desc: 'Real-time inventory refresh',
      icon: ScanLine,
      color: 'text-primary border-primary/50 hover:bg-primary/10',
      onClick: handleScanWarehouse,
      loading: scanning,
    },
    {
      id: 'lowstock',
      label: 'Low Stock Report',
      desc: 'Show urgent items only',
      icon: AlertTriangle,
      color: 'text-warning border-warning/50 hover:bg-warning/10',
      onClick: () => setActivePanel(activePanel === 'lowstock' ? null : 'lowstock'),
      badge: lowStockItems.length,
    },
    {
      id: 'supplier',
      label: 'Supplier Orders',
      desc: 'Create purchase orders',
      icon: Truck,
      color: 'text-accent border-accent/50 hover:bg-accent/10',
      onClick: handleAutoReorder,
    },
    {
      id: 'slow',
      label: 'Expired / Slow',
      desc: 'Identify dead stock',
      icon: PackageX,
      color: 'text-destructive border-destructive/50 hover:bg-destructive/10',
      onClick: () => setActivePanel(activePanel === 'slow' ? null : 'slow'),
      badge: slowItems.length,
    },
  ];

  return (
    <div className="glow-card p-4 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h2 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
          <ScanLine className="h-4 w-4" />
          INVENTORY OPS
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
                    {op.badge != null && op.badge > 0 && (
                      <span className="ml-auto text-[9px] bg-destructive/20 text-destructive px-1.5 rounded-full font-bold">
                        {op.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-0.5">{op.desc}</span>
                </Button>
              ))}
            </div>

            {/* Low Stock Panel */}
            <AnimatePresence>
              {activePanel === 'lowstock' && lowStockItems.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-1">
                      <p className="font-display text-[10px] text-destructive uppercase tracking-wider">Low Stock Items</p>
                      {lowStockItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1.5 text-[11px]">
                          <span className="text-foreground/80">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-destructive font-bold">{item.stock}/{item.reorderLevel}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-2 text-[9px] text-primary"
                              onClick={() => {
                                reorderProduct(item.id, item.reorderLevel * 2);
                                toast.success(`Reordered ${item.name}`);
                              }}
                            >
                              Order
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slow Items Panel */}
            <AnimatePresence>
              {activePanel === 'slow' && slowItems.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-1">
                      <p className="font-display text-[10px] text-warning uppercase tracking-wider">Slow / Overstocked Items</p>
                      {slowItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1.5 text-[11px]">
                          <span className="text-foreground/80">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-warning font-bold">{item.stock} units</span>
                            <span className="text-[9px] text-muted-foreground">${item.currentPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
