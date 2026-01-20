import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Plus, Pencil, Trash2, Tag, AlertTriangle, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProducts, useUpdateProduct } from '@/hooks/useProducts';
import { usePricingRules, useUpdatePricingRule, useDeletePricingRule, PricingRule } from '@/hooks/usePricingRules';
import { useCreateAgentLog } from '@/hooks/useAgentLogs';
import { PricingRuleDialog } from '@/components/PricingRuleDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PricingDashboard() {
  const { data: products = [] } = useProducts();
  const { data: rules = [], isLoading } = usePricingRules();
  const updateProduct = useUpdateProduct();
  const updateRule = useUpdatePricingRule();
  const deleteRule = useDeletePricingRule();
  const createLog = useCreateAgentLog();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<PricingRule | null>(null);
  
  const avgPriceChange = products.length > 0
    ? products.reduce((sum, p) => {
        const change = ((p.current_price - p.base_price) / p.base_price) * 100;
        return sum + change;
      }, 0) / products.length
    : 0;
  
  const highDemandCount = products.filter(p => p.demand_level === 'high').length;
  const lowDemandCount = products.filter(p => p.demand_level === 'low').length;
  
  const handleAdjustPrice = async (productId: string, demandLevel: 'high' | 'low') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const multiplier = demandLevel === 'high' ? 1.1 : 0.9;
    const newPrice = parseFloat((product.current_price * multiplier).toFixed(2));
    
    await updateProduct.mutateAsync({
      id: productId,
      updates: { current_price: newPrice, demand_level: demandLevel },
    });
    await createLog.mutateAsync({
      agent_type: 'pricing',
      action: `${demandLevel === 'high' ? 'Increased' : 'Decreased'} ${product.name} to $${newPrice.toFixed(2)}`,
      status: 'success',
    });
  };
  
  const handleApplyPromo = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newPrice = parseFloat((product.current_price * 0.9).toFixed(2));
    await updateProduct.mutateAsync({
      id: productId,
      updates: { current_price: newPrice },
    });
    await createLog.mutateAsync({
      agent_type: 'pricing',
      action: `Applied 10% promo to ${product.name}`,
      status: 'success',
    });
  };
  
  const handleToggleRule = async (rule: PricingRule) => {
    await updateRule.mutateAsync({
      id: rule.id,
      updates: { is_active: !rule.is_active },
    });
  };
  
  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };
  
  const handleDeleteRule = (rule: PricingRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (ruleToDelete) {
      await deleteRule.mutateAsync(ruleToDelete.id);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };
  
  const handleAddNewRule = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-accent font-display">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-accent flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          DYNAMIC PRICING
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="metric-card accent">
          <p className="text-xs text-muted-foreground mb-1">Avg Price Δ</p>
          <div className="flex items-center gap-1">
            <p className={cn(
              "text-xl font-display font-bold",
              avgPriceChange >= 0 ? "text-success" : "text-accent"
            )}>
              {avgPriceChange >= 0 ? '+' : ''}{avgPriceChange.toFixed(1)}%
            </p>
            {avgPriceChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-accent" />
            )}
          </div>
        </div>
        <div className="metric-card success">
          <p className="text-xs text-muted-foreground mb-1">High Demand</p>
          <p className="text-xl font-display font-bold text-success">{highDemandCount}</p>
        </div>
        <div className="metric-card warning">
          <p className="text-xs text-muted-foreground mb-1">Low Demand</p>
          <p className="text-xl font-display font-bold text-warning">{lowDemandCount}</p>
        </div>
      </div>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30">
          <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs">Pricing Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-3">
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            <AnimatePresence>
              {products.map((product, index) => {
                const priceChange = ((product.current_price - product.base_price) / product.base_price) * 100;
                const hasChanged = product.current_price !== product.base_price;
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="glow-card p-3 flex items-center gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm">{product.name}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                          product.demand_level === 'high' && "bg-success/20 text-success",
                          product.demand_level === 'low' && "bg-warning/20 text-warning",
                          product.demand_level === 'medium' && "bg-primary/20 text-primary"
                        )}>
                          {product.demand_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Base: ${product.base_price.toFixed(2)}</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-xl font-display font-bold text-primary">
                          {product.current_price.toFixed(2)}
                        </span>
                      </div>
                      {hasChanged && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "text-xs flex items-center gap-1 justify-end",
                            priceChange >= 0 ? "text-success" : "text-accent"
                          )}
                        >
                          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                          {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        </motion.span>
                      )}
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-success hover:bg-success/10"
                        onClick={() => handleAdjustPrice(product.id, 'high')}
                        title="Increase (High Demand)"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-warning hover:bg-warning/10"
                        onClick={() => handleAdjustPrice(product.id, 'low')}
                        title="Decrease (Low Demand)"
                      >
                        <TrendingDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-accent hover:bg-accent/10"
                        onClick={() => handleApplyPromo(product.id)}
                        title="Apply 10% Promo"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>
        
        <TabsContent value="rules" className="mt-3">
          <div className="mb-3">
            <Button size="sm" onClick={handleAddNewRule} className="bg-accent text-accent-foreground">
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
            <AnimatePresence>
              {rules.map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "glow-card p-3 flex items-center gap-4",
                    !rule.is_active && "opacity-50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm">{rule.name}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider",
                        rule.rule_type === 'demand' && "bg-accent/20 text-accent",
                        rule.rule_type === 'stock' && "bg-primary/20 text-primary",
                        rule.rule_type === 'time' && "bg-warning/20 text-warning",
                        rule.rule_type === 'promotion' && "bg-success/20 text-success"
                      )}>
                        {rule.rule_type}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rule.adjustment_type === 'percentage' 
                        ? `${rule.adjustment_value > 0 ? '+' : ''}${rule.adjustment_value}%`
                        : `${rule.adjustment_value > 0 ? '+' : ''}$${rule.adjustment_value.toFixed(2)}`
                      }
                      {' • Priority: '}{rule.priority}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 p-0",
                        rule.is_active ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
                      )}
                      onClick={() => handleToggleRule(rule)}
                      title={rule.is_active ? 'Disable' : 'Enable'}
                    >
                      {rule.is_active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditRule(rule)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRule(rule)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
      
      <PricingRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Pricing Rule
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ruleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
