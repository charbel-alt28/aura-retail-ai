import { useMemo } from 'react';
import { useHypermarketStore } from '@/lib/store';
import { useWastageLogs } from '@/hooks/useWastageLogs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
  LineChart, Line, Area, AreaChart,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package, Trash2, DollarSign } from 'lucide-react';

const COLORS = [
  'hsl(185 100% 50%)',
  'hsl(320 100% 55%)',
  'hsl(145 80% 45%)',
  'hsl(45 100% 55%)',
  'hsl(260 60% 55%)',
  'hsl(0 85% 55%)',
];

export function AnalyticsDashboard() {
  const { products } = useHypermarketStore();
  const { data: wastageLogs } = useWastageLogs();

  // Category distribution
  const categoryData = useMemo(() => {
    const map = new Map<string, { count: number; totalStock: number; totalValue: number }>();
    products.forEach(p => {
      const cat = p.category || 'Other';
      const existing = map.get(cat) || { count: 0, totalStock: 0, totalValue: 0 };
      existing.count++;
      existing.totalStock += p.stock;
      existing.totalValue += p.currentPrice * p.stock;
      map.set(cat, existing);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, fullName: name, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 8);
  }, [products]);

  // Stock health by category
  const stockHealthData = useMemo(() => {
    const map = new Map<string, { healthy: number; low: number; critical: number }>();
    products.forEach(p => {
      const cat = p.category || 'Other';
      const existing = map.get(cat) || { healthy: 0, low: 0, critical: 0 };
      if (p.stock <= 0) existing.critical++;
      else if (p.stock < p.reorderLevel) existing.low++;
      else existing.healthy++;
      map.set(cat, existing);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, ...data }))
      .slice(0, 8);
  }, [products]);

  // Pricing spread
  const pricingData = useMemo(() => {
    const ranges = [
      { range: '$0-2', min: 0, max: 2, count: 0 },
      { range: '$2-5', min: 2, max: 5, count: 0 },
      { range: '$5-10', min: 5, max: 10, count: 0 },
      { range: '$10-20', min: 10, max: 20, count: 0 },
      { range: '$20-50', min: 20, max: 50, count: 0 },
      { range: '$50+', min: 50, max: Infinity, count: 0 },
    ];
    products.forEach(p => {
      const r = ranges.find(r => p.currentPrice >= r.min && p.currentPrice < r.max);
      if (r) r.count++;
    });
    return ranges;
  }, [products]);

  // Wastage summary
  const wastageData = useMemo(() => {
    if (!wastageLogs?.length) return [];
    const map = new Map<string, number>();
    wastageLogs.forEach(log => {
      const cat = log.category || 'Other';
      map.set(cat, (map.get(cat) || 0) + Number(log.total_value_lost));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [wastageLogs]);

  // Demand distribution
  const demandData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    products.forEach(p => {
      counts[p.demandLevel as keyof typeof counts]++;
    });
    return [
      { name: 'High', value: counts.high },
      { name: 'Medium', value: counts.medium },
      { name: 'Low', value: counts.low },
    ];
  }, [products]);

  const chartConfigs: Record<string, ChartConfig> = {
    category: { totalValue: { label: 'Value ($)', color: 'hsl(185 100% 50%)' } },
    stock: {
      healthy: { label: 'Healthy', color: 'hsl(145 80% 45%)' },
      low: { label: 'Low', color: 'hsl(45 100% 55%)' },
      critical: { label: 'Critical', color: 'hsl(0 85% 55%)' },
    },
    pricing: { count: { label: 'Products', color: 'hsl(260 60% 55%)' } },
    wastage: { value: { label: 'Loss ($)', color: 'hsl(0 85% 55%)' } },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-display text-sm tracking-wider text-primary">ANALYTICS OVERVIEW</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Value */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-3">
          <h3 className="font-display text-[11px] tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            INVENTORY VALUE BY CATEGORY
          </h3>
          <ChartContainer config={chartConfigs.category} className="h-[200px] w-full">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 20%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="totalValue" fill="hsl(185 100% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Stock Health */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-3">
          <h3 className="font-display text-[11px] tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-success" />
            STOCK HEALTH BY CATEGORY
          </h3>
          <ChartContainer config={chartConfigs.stock} className="h-[200px] w-full">
            <BarChart data={stockHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 20%)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="healthy" stackId="a" fill="hsl(145 80% 45%)" />
              <Bar dataKey="low" stackId="a" fill="hsl(45 100% 55%)" />
              <Bar dataKey="critical" stackId="a" fill="hsl(0 85% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Pricing Distribution */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-3">
          <h3 className="font-display text-[11px] tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-accent" />
            PRICE DISTRIBUTION
          </h3>
          <ChartContainer config={chartConfigs.pricing} className="h-[200px] w-full">
            <AreaChart data={pricingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 20%)" />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="count" fill="hsl(260 60% 35% / 0.3)" stroke="hsl(260 60% 55%)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Demand Pie + Wastage */}
        <div className="bg-card/50 border border-border/50 rounded-lg p-3">
          <h3 className="font-display text-[11px] tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
            {wastageData.length ? 'WASTAGE BY CATEGORY' : 'DEMAND DISTRIBUTION'}
          </h3>
          {wastageData.length ? (
            <ChartContainer config={chartConfigs.wastage} className="h-[200px] w-full">
              <BarChart data={wastageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 20%)" />
                <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(0 85% 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartContainer config={{ value: { label: 'Count', color: 'hsl(185 100% 50%)' } }} className="h-[200px] w-full">
              <PieChart>
                <Pie data={demandData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {demandData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total Products', value: products.length, color: 'text-primary' },
          { label: 'Total Stock', value: products.reduce((s, p) => s + p.stock, 0).toLocaleString(), color: 'text-success' },
          { label: 'Avg Price', value: `$${(products.reduce((s, p) => s + p.currentPrice, 0) / products.length).toFixed(2)}`, color: 'text-accent' },
          { label: 'Wastage Logs', value: wastageLogs?.length ?? 0, color: 'text-destructive' },
        ].map(stat => (
          <div key={stat.label} className="bg-card/30 border border-border/30 rounded-lg p-2 text-center">
            <p className={`font-display text-lg ${stat.color}`}>{stat.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
