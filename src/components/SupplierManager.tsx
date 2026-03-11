import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Plus, Package, Send, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHypermarketStore } from '@/lib/store';

interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

interface PurchaseOrder {
  id: string;
  supplier_id: string | null;
  status: string;
  total_amount: number;
  notes: string | null;
  ordered_at: string | null;
  created_at: string;
  suppliers?: { name: string } | null;
}

export function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'suppliers' | 'orders' | null>('suppliers');
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_name: '', email: '', phone: '' });
  const [newOrder, setNewOrder] = useState({ supplier_id: '', notes: '' });
  const { products } = useHypermarketStore();

  const fetchData = useCallback(async () => {
    const [suppRes, ordRes] = await Promise.all([
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('purchase_orders').select('*, suppliers(name)').order('created_at', { ascending: false }).limit(20),
    ]);
    if (suppRes.data) setSuppliers(suppRes.data);
    if (ordRes.data) setOrders(ordRes.data as any);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addSupplier = async () => {
    if (!newSupplier.name.trim()) { toast.error('Supplier name required'); return; }
    const { error } = await supabase.from('suppliers').insert({
      name: newSupplier.name,
      contact_name: newSupplier.contact_name || null,
      email: newSupplier.email || null,
      phone: newSupplier.phone || null,
    });
    if (error) { toast.error('Failed to add supplier'); return; }
    toast.success('Supplier added');
    setNewSupplier({ name: '', contact_name: '', email: '', phone: '' });
    setShowSupplierForm(false);
    fetchData();
  };

  const autoGenerateOrder = async () => {
    const lowStock = products.filter(p => p.stock <= p.reorderLevel);
    if (lowStock.length === 0) { toast.info('No products below reorder level'); return; }

    const totalAmount = lowStock.reduce((sum, p) => sum + (p.basePrice * (p.reorderLevel * 2 - p.stock)), 0);
    const itemList = lowStock.map(p => `${p.name} (need ${p.reorderLevel * 2 - p.stock} units)`).join(', ');

    const { error } = await supabase.from('purchase_orders').insert({
      supplier_id: suppliers[0]?.id || null,
      status: 'draft',
      total_amount: Math.round(totalAmount * 100) / 100,
      notes: `Auto-generated restock: ${itemList}`,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) { toast.error('Failed to create order'); return; }
    toast.success(`Draft PO created for ${lowStock.length} low-stock items`);
    fetchData();
  };

  const createOrder = async () => {
    const { error } = await supabase.from('purchase_orders').insert({
      supplier_id: newOrder.supplier_id || null,
      status: 'draft',
      total_amount: 0,
      notes: newOrder.notes || null,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });
    if (error) { toast.error('Failed to create order'); return; }
    toast.success('Purchase order created');
    setNewOrder({ supplier_id: '', notes: '' });
    setShowOrderForm(false);
    fetchData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'ordered') updates.ordered_at = new Date().toISOString();
    if (status === 'received') updates.received_at = new Date().toISOString();
    const { error } = await supabase.from('purchase_orders').update(updates).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(`Order ${status}`);
    fetchData();
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    ordered: 'bg-warning/20 text-warning',
    received: 'bg-success/20 text-success',
    cancelled: 'bg-destructive/20 text-destructive',
  };

  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;

  return (
    <div className="glow-card">
      {/* Suppliers Section */}
      <button onClick={() => setExpandedSection(expandedSection === 'suppliers' ? null : 'suppliers')} className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <span className="font-display text-xs tracking-wider text-primary">SUPPLIERS</span>
          <Badge variant="outline" className="text-[10px]">{suppliers.length}</Badge>
        </div>
        {expandedSection === 'suppliers' ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </button>

      {expandedSection === 'suppliers' && (
        <div className="px-3 pb-3 space-y-2">
          <ScrollArea className="max-h-[150px]">
            {suppliers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No suppliers yet</p>
            ) : (
              <div className="space-y-1">
                {suppliers.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1 px-2 rounded bg-muted/20 text-xs">
                    <div>
                      <span className="font-medium text-foreground">{s.name}</span>
                      {s.contact_name && <span className="text-muted-foreground ml-2">({s.contact_name})</span>}
                    </div>
                    <Badge variant={s.is_active ? 'default' : 'secondary'} className="text-[9px]">
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-xs h-7">
                <Plus className="h-3 w-3 mr-1" /> Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="font-display text-sm">New Supplier</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Input placeholder="Company name *" value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} className="text-xs h-8" />
                <Input placeholder="Contact name" value={newSupplier.contact_name} onChange={e => setNewSupplier(p => ({ ...p, contact_name: e.target.value }))} className="text-xs h-8" />
                <Input placeholder="Email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} className="text-xs h-8" />
                <Input placeholder="Phone" value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} className="text-xs h-8" />
                <Button onClick={addSupplier} className="w-full text-xs h-8">Add Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Purchase Orders Section */}
      <button onClick={() => setExpandedSection(expandedSection === 'orders' ? null : 'orders')} className="w-full flex items-center justify-between p-3 border-t border-border hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-accent" />
          <span className="font-display text-xs tracking-wider text-accent">PURCHASE ORDERS</span>
          <Badge variant="outline" className="text-[10px]">{orders.length}</Badge>
        </div>
        {expandedSection === 'orders' ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </button>

      {expandedSection === 'orders' && (
        <div className="px-3 pb-3 space-y-2">
          {lowStockCount > 0 && (
            <Button variant="destructive" size="sm" className="w-full text-xs h-7" onClick={autoGenerateOrder}>
              <Send className="h-3 w-3 mr-1" /> Auto-Restock {lowStockCount} Low Items
            </Button>
          )}

          <ScrollArea className="max-h-[150px]">
            {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No purchase orders yet</p>
            ) : (
              <div className="space-y-1">
                {orders.map(o => (
                  <div key={o.id} className="py-1.5 px-2 rounded bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">#{o.id.slice(0, 8)}</span>
                      <Badge className={`text-[9px] ${statusColor[o.status] || ''}`}>{o.status}</Badge>
                    </div>
                    {o.notes && <p className="text-[10px] text-muted-foreground truncate">{o.notes}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">${o.total_amount.toFixed(2)}</span>
                      {o.status === 'draft' && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => updateOrderStatus(o.id, 'ordered')}>Mark Ordered</Button>
                          <Button variant="ghost" size="sm" className="h-5 text-[9px] px-1.5 text-destructive" onClick={() => updateOrderStatus(o.id, 'cancelled')}>
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      )}
                      {o.status === 'ordered' && (
                        <Button variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => updateOrderStatus(o.id, 'received')}>Mark Received</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-xs h-7">
                <Plus className="h-3 w-3 mr-1" /> New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="font-display text-sm">New Purchase Order</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Select value={newOrder.supplier_id} onValueChange={v => setNewOrder(p => ({ ...p, supplier_id: v }))}>
                  <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Notes" value={newOrder.notes} onChange={e => setNewOrder(p => ({ ...p, notes: e.target.value }))} className="text-xs h-8" />
                <Button onClick={createOrder} className="w-full text-xs h-8">Create Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
