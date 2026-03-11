import { useState, useMemo } from 'react';
import { Bell, AlertTriangle, CalendarX, Shield, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHypermarketStore } from '@/lib/store';
import { useExpiryTracking } from '@/hooks/useExpiryTracking';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'low_stock' | 'expiry' | 'security' | 'info';
  title: string;
  message: string;
  icon: typeof Bell;
  color: string;
  time: string;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { products } = useHypermarketStore();
  const expiryStats = useExpiryTracking();

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // Low stock alerts
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock < p.reorderLevel);
    const outOfStockItems = products.filter(p => p.stock <= 0);

    if (outOfStockItems.length > 0) {
      notifs.push({
        id: 'out-of-stock',
        type: 'low_stock',
        title: 'Out of Stock Alert',
        message: `${outOfStockItems.length} product${outOfStockItems.length > 1 ? 's are' : ' is'} out of stock and need${outOfStockItems.length === 1 ? 's' : ''} immediate restock.`,
        icon: Package,
        color: 'text-destructive',
        time: 'Now',
      });
    }

    if (lowStockItems.length > 0) {
      notifs.push({
        id: 'low-stock',
        type: 'low_stock',
        title: 'Low Stock Warning',
        message: `${lowStockItems.length} product${lowStockItems.length > 1 ? 's are' : ' is'} below reorder level.`,
        icon: AlertTriangle,
        color: 'text-warning',
        time: 'Now',
      });
    }

    // Expiry alerts
    if (expiryStats.totalAlreadyExpired > 0) {
      notifs.push({
        id: 'expired',
        type: 'expiry',
        title: 'Expired Products',
        message: `${expiryStats.totalAlreadyExpired} product${expiryStats.totalAlreadyExpired > 1 ? 's have' : ' has'} expired and should be removed.`,
        icon: CalendarX,
        color: 'text-destructive',
        time: 'Now',
      });
    }

    if (expiryStats.totalExpiringWithin3Days > 0) {
      notifs.push({
        id: 'expiring-soon',
        type: 'expiry',
        title: 'Expiring Soon',
        message: `${expiryStats.totalExpiringWithin3Days} product${expiryStats.totalExpiringWithin3Days > 1 ? 's' : ''} expiring within 3 days.`,
        icon: CalendarX,
        color: 'text-warning',
        time: 'Soon',
      });
    }

    // High demand alerts
    const highDemand = products.filter(p => p.demandLevel === 'high' && p.stock < p.reorderLevel * 2);
    if (highDemand.length > 0) {
      notifs.push({
        id: 'high-demand',
        type: 'info',
        title: 'High Demand Alert',
        message: `${highDemand.length} high-demand product${highDemand.length > 1 ? 's have' : ' has'} limited stock.`,
        icon: AlertTriangle,
        color: 'text-accent',
        time: 'Now',
      });
    }

    return notifs.filter(n => !dismissed.has(n.id));
  }, [products, expiryStats, dismissed]);

  const dismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  const clearAll = () => {
    setDismissed(new Set(notifications.map(n => n.id)));
  };

  const count = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center"
            >
              {count}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-card border-border">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <h3 className="font-display text-xs tracking-wider text-primary">NOTIFICATIONS</h3>
          {count > 0 && (
            <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[320px]">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="p-1">
                {notifications.map(notif => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-muted/20 group"
                  >
                    <notif.icon className={cn('h-4 w-4 mt-0.5 shrink-0', notif.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight">{notif.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{notif.message}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-1">{notif.time}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => dismiss(notif.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
