import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/lib/store';
import { productImages } from '@/lib/productData';
import { productMetadata } from '@/lib/productMetadata';
import { Package, MapPin, Calendar, Clock, Weight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailDialog({ open, onOpenChange, product }: ProductDetailDialogProps) {
  if (!product) return null;

  const meta = productMetadata[product.id];
  const image = productImages[product.id];

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const isExpiringSoon = meta ? new Date(meta.doe) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        {/* Header with image */}
        <div className="relative h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-cover opacity-90" />
          ) : (
            <Package className="h-16 w-16 text-muted-foreground" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-primary tracking-wide">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{product.category}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-sm font-display font-bold text-primary">${product.currentPrice.toFixed(2)}</span>
              {meta?.weight && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{meta.weight}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          {meta && (
            <>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed">{meta.description}</p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="h-3 w-3 text-accent" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Origin</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{meta.origin}</p>
                </div>

                <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Weight className="h-3 w-3 text-accent" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Size</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{meta.weight || '—'}</p>
                </div>

                <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3 text-success" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Produced</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatDate(meta.dop)}</p>
                </div>

                <div className={cn(
                  "rounded-lg border p-3",
                  isExpiringSoon ? "bg-destructive/10 border-destructive/30" : "bg-muted/20 border-border/50"
                )}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className={cn("h-3 w-3", isExpiringSoon ? "text-destructive" : "text-warning")} />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Expires</span>
                  </div>
                  <p className={cn(
                    "text-sm font-semibold",
                    isExpiringSoon ? "text-destructive" : "text-foreground"
                  )}>
                    {formatDate(meta.doe)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Stock info */}
          <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Stock Level</span>
              <span>{product.stock} / {product.reorderLevel} reorder point</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  product.stock < product.reorderLevel ? "bg-destructive" :
                  product.stock < product.reorderLevel * 1.5 ? "bg-warning" : "bg-success"
                )}
                style={{ width: `${Math.min((product.stock / (product.reorderLevel * 3)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
