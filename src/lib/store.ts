import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  stock: number;
  reorderLevel: number;
  demandForecast: number;
  basePrice: number;
  currentPrice: number;
  demandLevel: 'low' | 'medium' | 'high';
  category: string;
}

export interface CustomerQuery {
  id: string;
  timestamp: Date;
  customerName: string;
  queryType: string;
  query: string;
  response: string;
  status: 'pending' | 'resolved' | 'escalated';
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  agent: 'inventory' | 'pricing' | 'customer';
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface HypermarketState {
  products: Product[];
  queries: CustomerQuery[];
  agentLogs: AgentLog[];
  isSimulating: boolean;
  
  // Inventory actions
  updateStock: (productId: string, newStock: number) => void;
  reorderProduct: (productId: string, quantity: number) => void;
  
  // Pricing actions
  adjustPrice: (productId: string, demandLevel: 'low' | 'medium' | 'high') => void;
  setPrice: (productId: string, newPrice: number) => void;
  applyPromotion: (productId: string, discountPercent: number) => void;
  
  // Customer service actions
  addQuery: (query: Omit<CustomerQuery, 'id' | 'timestamp'>) => void;
  resolveQuery: (queryId: string) => void;
  
  // Agent actions
  addAgentLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => void;
  setSimulating: (value: boolean) => void;
  
  // Simulation
  runDemoScenario: () => Promise<void>;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Milk', stock: 150, reorderLevel: 50, demandForecast: 45, basePrice: 3.50, currentPrice: 3.50, demandLevel: 'medium', category: 'Dairy' },
  { id: '2', name: 'Bread', stock: 200, reorderLevel: 75, demandForecast: 60, basePrice: 2.50, currentPrice: 2.50, demandLevel: 'high', category: 'Bakery' },
  { id: '3', name: 'Eggs', stock: 300, reorderLevel: 100, demandForecast: 80, basePrice: 4.00, currentPrice: 4.00, demandLevel: 'medium', category: 'Dairy' },
  { id: '4', name: 'Cheese', stock: 80, reorderLevel: 30, demandForecast: 35, basePrice: 6.00, currentPrice: 6.00, demandLevel: 'low', category: 'Dairy' },
  { id: '5', name: 'Yogurt', stock: 120, reorderLevel: 40, demandForecast: 50, basePrice: 2.00, currentPrice: 2.00, demandLevel: 'high', category: 'Dairy' },
  { id: '6', name: 'Apples', stock: 45, reorderLevel: 60, demandForecast: 70, basePrice: 1.50, currentPrice: 1.50, demandLevel: 'high', category: 'Produce' },
  { id: '7', name: 'Orange Juice', stock: 90, reorderLevel: 35, demandForecast: 40, basePrice: 4.50, currentPrice: 4.50, demandLevel: 'medium', category: 'Beverages' },
  { id: '8', name: 'Chicken', stock: 25, reorderLevel: 30, demandForecast: 55, basePrice: 8.00, currentPrice: 8.00, demandLevel: 'high', category: 'Meat' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useHypermarketStore = create<HypermarketState>((set, get) => ({
  products: initialProducts,
  queries: [],
  agentLogs: [],
  isSimulating: false,

  updateStock: (productId, newStock) => {
    set(state => ({
      products: state.products.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      )
    }));
  },

  reorderProduct: (productId, quantity) => {
    const product = get().products.find(p => p.id === productId);
    if (product) {
      set(state => ({
        products: state.products.map(p => 
          p.id === productId ? { ...p, stock: p.stock + quantity } : p
        )
      }));
      get().addAgentLog({
        agent: 'inventory',
        action: 'REORDER',
        details: `Reordered ${quantity} units of ${product.name}. New stock: ${product.stock + quantity}`,
        status: 'success'
      });
    }
  },

  adjustPrice: (productId, demandLevel) => {
    const product = get().products.find(p => p.id === productId);
    if (product) {
      let multiplier = 1;
      if (demandLevel === 'high') multiplier = 1.15;
      else if (demandLevel === 'low') multiplier = 0.85;
      
      const newPrice = Math.round(product.basePrice * multiplier * 100) / 100;
      
      set(state => ({
        products: state.products.map(p => 
          p.id === productId ? { ...p, currentPrice: newPrice, demandLevel } : p
        )
      }));
      
      get().addAgentLog({
        agent: 'pricing',
        action: 'PRICE_ADJUST',
        details: `${product.name}: $${product.currentPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${demandLevel} demand)`,
        status: demandLevel === 'high' ? 'success' : demandLevel === 'low' ? 'warning' : 'info'
      });
    }
  },

  setPrice: (productId, newPrice) => {
    const product = get().products.find(p => p.id === productId);
    if (product) {
      set(state => ({
        products: state.products.map(p =>
          p.id === productId ? { ...p, currentPrice: newPrice } : p
        )
      }));
      get().addAgentLog({
        agent: 'pricing',
        action: 'MANUAL_PRICE',
        details: `${product.name}: $${product.currentPrice.toFixed(2)} → $${newPrice.toFixed(2)} (manual)`,
        status: 'info'
      });
    }
  },

  applyPromotion: (productId, discountPercent) => {
    const product = get().products.find(p => p.id === productId);
    if (product) {
      const newPrice = Math.round(product.currentPrice * (1 - discountPercent / 100) * 100) / 100;
      
      set(state => ({
        products: state.products.map(p => 
          p.id === productId ? { ...p, currentPrice: newPrice } : p
        )
      }));
      
      get().addAgentLog({
        agent: 'pricing',
        action: 'PROMOTION',
        details: `Applied ${discountPercent}% discount to ${product.name}. New price: $${newPrice.toFixed(2)}`,
        status: 'info'
      });
    }
  },

  addQuery: (query) => {
    const newQuery: CustomerQuery = {
      ...query,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    };
    set(state => ({ queries: [newQuery, ...state.queries] }));
    
    get().addAgentLog({
      agent: 'customer',
      action: 'QUERY_RECEIVED',
      details: `From ${query.customerName}: "${query.query.substring(0, 50)}..."`,
      status: query.status === 'resolved' ? 'success' : 'warning'
    });
  },

  resolveQuery: (queryId) => {
    set(state => ({
      queries: state.queries.map(q => 
        q.id === queryId ? { ...q, status: 'resolved' } : q
      )
    }));
  },

  addAgentLog: (log) => {
    const newLog: AgentLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    };
    set(state => ({ agentLogs: [newLog, ...state.agentLogs].slice(0, 50) }));
  },

  setSimulating: (value) => set({ isSimulating: value }),

  runDemoScenario: async () => {
    const { addAgentLog, reorderProduct, adjustPrice, addQuery, products } = get();
    
    set({ isSimulating: true });
    
    // Scenario 1: Inventory Check
    addAgentLog({
      agent: 'inventory',
      action: 'SCAN',
      details: 'Initiating automated inventory scan...',
      status: 'info'
    });
    
    await delay(1500);
    
    // Find low stock items
    const lowStockItems = products.filter(p => p.stock < p.reorderLevel);
    if (lowStockItems.length > 0) {
      addAgentLog({
        agent: 'inventory',
        action: 'ALERT',
        details: `Detected ${lowStockItems.length} item(s) below reorder threshold`,
        status: 'warning'
      });
      
      await delay(1000);
      
      for (const item of lowStockItems) {
        reorderProduct(item.id, item.reorderLevel * 2);
        await delay(800);
      }
    }
    
    await delay(1500);
    
    // Scenario 2: Dynamic Pricing
    addAgentLog({
      agent: 'pricing',
      action: 'ANALYZE',
      details: 'Analyzing demand patterns and market conditions...',
      status: 'info'
    });
    
    await delay(1200);
    
    // Adjust prices based on demand
    const highDemandProduct = products.find(p => p.demandLevel === 'high' && p.currentPrice === p.basePrice);
    if (highDemandProduct) {
      adjustPrice(highDemandProduct.id, 'high');
      await delay(800);
    }
    
    const lowDemandProduct = products.find(p => p.demandLevel === 'low' && p.currentPrice === p.basePrice);
    if (lowDemandProduct) {
      adjustPrice(lowDemandProduct.id, 'low');
      await delay(800);
    }
    
    await delay(1500);
    
    // Scenario 3: Customer Service
    addAgentLog({
      agent: 'customer',
      action: 'PROCESS',
      details: 'Processing incoming customer queries...',
      status: 'info'
    });
    
    await delay(1000);
    
    addQuery({
      customerName: 'Sarah Johnson',
      queryType: 'return_policy',
      query: 'What is your return policy for fresh produce?',
      response: 'Fresh produce can be returned within 3 days with receipt for a full refund. Our quality guarantee ensures your satisfaction.',
      status: 'resolved'
    });
    
    await delay(1200);
    
    addQuery({
      customerName: 'Mike Chen',
      queryType: 'delivery',
      query: 'Can I get same-day delivery for my order?',
      response: 'Yes! Orders placed before 2 PM qualify for same-day delivery. Free delivery on orders over $50.',
      status: 'resolved'
    });
    
    await delay(1000);
    
    // Final summary
    addAgentLog({
      agent: 'inventory',
      action: 'SUMMARY',
      details: `Demo complete: ${lowStockItems.length} items restocked, 2 prices optimized, 2 queries resolved`,
      status: 'success'
    });
    
    set({ isSimulating: false });
  }
}));
