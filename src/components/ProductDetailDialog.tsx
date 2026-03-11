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
      <DialogContent className="bg-card border-border max-w-2xl p-0 overflow-hidden">
        {/* Top section: Image + Description side by side */}
        <div className="flex flex-col sm:flex-row">
          {/* Full image */}
          <div className="sm:w-1/2 w-full bg-muted/20 flex items-center justify-center p-4 min-h-[240px]">
            {image ? (
              <img src={image} alt={product.name} className="w-full h-auto max-h-[320px] object-contain rounded-lg" />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground" />
            )}
          </div>

          {/* Description & header info */}
          <div className="sm:w-1/2 w-full p-5 flex flex-col justify-center gap-3">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-foreground tracking-wide">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">{product.category}</span>
              <span className="text-xs text-muted-foreground/50">•</span>
              <span className="text-base font-display font-bold text-primary">${product.currentPrice.toFixed(2)}</span>
              {meta?.weight && (
                <>
                  <span className="text-xs text-muted-foreground/50">•</span>
                  <span className="text-xs font-medium text-muted-foreground">{meta.weight}</span>
                </>
              )}
            </div>
            {meta && (
              <div className="flex items-start gap-2.5 bg-muted/20 border border-border/50 rounded-lg p-3">
                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-foreground leading-relaxed">{meta.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom details */}
        <div className="p-4 pt-0 space-y-3">
          {meta && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Origin</span>
                </div>
                <p className="text-sm font-bold text-foreground">{meta.origin}</p>
              </div>
              <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Weight className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Size</span>
                </div>
                <p className="text-sm font-bold text-foreground">{meta.weight || '—'}</p>
              </div>
              <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-success" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Produced</span>
                </div>
                <p className="text-sm font-bold text-foreground">{formatDate(meta.dop)}</p>
              </div>
              <div className={cn(
                "rounded-lg border p-3",
                isExpiringSoon ? "bg-destructive/10 border-destructive/30" : "bg-muted/20 border-border/50"
              )}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock className={cn("h-3.5 w-3.5", isExpiringSoon ? "text-destructive" : "text-warning")} />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Expires</span>
                </div>
                <p className={cn("text-sm font-bold", isExpiringSoon ? "text-destructive" : "text-foreground")}>
                  {formatDate(meta.doe)}
                </p>
              </div>
            </div>
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
