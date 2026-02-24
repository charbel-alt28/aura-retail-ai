import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Pencil, Check, X, Search, Info } from 'lucide-react';
import { useHypermarketStore, Product } from '@/lib/store';
import { productImages, CATEGORIES, Category } from '@/lib/productData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductDetailDialog } from '@/components/ProductDetailDialog';

function ProductCard({ product, index, onShowDetail }: { product: Product; index: number; onShowDetail: (product: Product) => void }) {
  const { reorderProduct, adjustPrice, setPrice } = useHypermarketStore();
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState(product.currentPrice.toFixed(2));
  
  const stockStatus = product.stock < product.reorderLevel ? 'critical' : 
                      product.stock < product.reorderLevel * 1.5 ? 'warning' : 'good';
  
  const priceChange = product.currentPrice !== product.basePrice;
  const priceUp = product.currentPrice > product.basePrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015 }}
      className={cn(
        "glow-card p-2.5 flex flex-col",
        stockStatus === 'critical' && "border-destructive/50"
      )}
    >
      {/* Top: Image + Name + Status */}
      <div className="flex gap-2 mb-1.5">
        <div
          className="w-10 h-10 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 border border-border/50 cursor-pointer"
          onClick={() => onShowDetail(product)}
        >
          {productImages[product.id] ? (
            <img src={productImages[product.id]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[11px] font-semibold truncate leading-tight">{product.name}</h3>
          <p className="text-[9px] text-muted-foreground leading-tight">{product.category}</p>
          <span className={cn(
            "inline-block mt-0.5 px-1 py-px rounded text-[8px] font-bold uppercase tracking-wider",
            stockStatus === 'critical' && "status-critical",
            stockStatus === 'warning' && "status-warning",
            stockStatus === 'good' && "status-success"
          )}>
            {stockStatus}
          </span>
        </div>
      </div>

      {/* Stock + Price row */}
      <div className="flex justify-between items-end mb-1.5">
        <div>
          <p className="text-[9px] text-muted-foreground">Stock</p>
          <span className={cn(
            "text-sm font-display font-bold leading-none",
            stockStatus === 'critical' && "text-destructive",
            stockStatus === 'warning' && "text-warning",
            stockStatus === 'good' && "text-success"
          )}>
            {product.stock}
          </span>
          <span className="text-[9px] text-muted-foreground">/{product.reorderLevel}</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground">Price</p>
          {editingPrice ? (
            <div className="flex items-center gap-0.5">
              <Input
                type="number" step="0.01" min="0" value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { const v = parseFloat(priceValue); if (!isNaN(v) && v >= 0) { setPrice(product.id, v); setEditingPrice(false); } }
                  if (e.key === 'Escape') { setPriceValue(product.currentPrice.toFixed(2)); setEditingPrice(false); }
                }}
                autoFocus className="h-5 w-14 bg-input border-border text-[10px] px-1"
              />
              <button onClick={() => { const v = parseFloat(priceValue); if (!isNaN(v) && v >= 0) { setPrice(product.id, v); setEditingPrice(false); } }} className="text-success"><Check className="h-2.5 w-2.5" /></button>
              <button onClick={() => { setPriceValue(product.currentPrice.toFixed(2)); setEditingPrice(false); }} className="text-destructive"><X className="h-2.5 w-2.5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => { setPriceValue(product.currentPrice.toFixed(2)); setEditingPrice(true); }}>
              <span className="text-sm font-display font-bold text-primary leading-none">${product.currentPrice.toFixed(2)}</span>
              {priceChange && (
                <span className={cn("flex items-center", priceUp ? "text-success" : "text-accent")}>
                  {priceUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-1.5">
        <motion.div
          className={cn("h-full rounded-full", stockStatus === 'critical' && "bg-destructive", stockStatus === 'warning' && "bg-warning", stockStatus === 'good' && "bg-success")}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((product.stock / (product.reorderLevel * 3)) * 100, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Demand */}
      <div className="flex justify-between text-[9px] text-muted-foreground mb-2">
        <span>Demand: <span className={cn("font-semibold", product.demandLevel === 'high' && "text-success", product.demandLevel === 'low' && "text-warning", product.demandLevel === 'medium' && "text-primary")}>{product.demandLevel}</span></span>
        <span>{product.demandForecast}/day</span>
      </div>

      {/* Buttons — always visible, stacked to fit */}
      <div className="flex gap-1 mt-auto">
        {stockStatus !== 'good' && (
          <Button size="sm" variant="outline" className="flex-1 text-[9px] h-5 px-1 border-primary/50 text-primary hover:bg-primary/10" onClick={() => reorderProduct(product.id, product.reorderLevel * 2)}>
            Reorder
          </Button>
        )}
        <Button size="sm" variant="outline" className="flex-1 text-[9px] h-5 px-1 border-accent/50 text-accent hover:bg-accent/10" onClick={() => onShowDetail(product)}>
          Details
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-[9px] h-5 px-1 border-primary/50 text-primary hover:bg-primary/10" onClick={() => adjustPrice(product.id, product.demandLevel)}>
          Optimize
        </Button>
      </div>
    </motion.div>
  );
}

export function InventoryDashboard() {
  const { products } = useHypermarketStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);
  
  const criticalCount = products.filter(p => p.stock < p.reorderLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.currentPrice), 0);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-primary flex items-center gap-2">
          <Package className="h-5 w-5" />
          INVENTORY MONITOR
        </h2>
        <div className="flex items-center gap-3 text-xs">
          {criticalCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{criticalCount} Critical</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 text-success">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{products.length - criticalCount} OK</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="metric-card">
          <p className="text-[10px] text-muted-foreground mb-0.5">Total SKUs</p>
          <p className="text-xl font-display font-bold text-foreground">{products.length}</p>
        </div>
        <div className="metric-card accent">
          <p className="text-[10px] text-muted-foreground mb-0.5">Inventory Value</p>
          <p className="text-xl font-display font-bold text-accent">${totalValue.toFixed(0)}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] text-muted-foreground mb-0.5">Showing</p>
          <p className="text-xl font-display font-bold text-foreground">{filteredProducts.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-xs bg-input border-border"
        />
      </div>
      
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all border",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
            )}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1 opacity-60">
                {products.filter(p => p.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onShowDetail={setDetailProduct} />
          ))}
        </AnimatePresence>
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
            No products found
          </div>
        )}
      </div>

      <ProductDetailDialog
        open={!!detailProduct}
        onOpenChange={(open) => !open && setDetailProduct(null)}
        product={detailProduct}
      />
    </div>
  );
}
