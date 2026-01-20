import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, ProductInsert, ProductUpdate, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!product;

  const [formData, setFormData] = useState<Partial<ProductInsert>>({
    name: product?.name || '',
    sku: product?.sku || '',
    base_price: product?.base_price || 0,
    current_price: product?.current_price || 0,
    stock: product?.stock || 0,
    reorder_point: product?.reorder_point || 10,
    demand_level: product?.demand_level || 'medium',
    category: product?.category || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && product) {
      await updateProduct.mutateAsync({
        id: product.id,
        updates: formData as ProductUpdate,
      });
    } else {
      await createProduct.mutateAsync(formData as ProductInsert);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="bg-input border-border"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price ($)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_price">Current Price ($)</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) })}
                className="bg-input border-border"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
                className="bg-input border-border"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demand_level">Demand Level</Label>
              <Select
                value={formData.demand_level}
                onValueChange={(value) => setFormData({ ...formData, demand_level: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
