import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AgentStatusPanel } from '@/components/AgentStatusPanel';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import { PricingDashboard } from '@/components/PricingDashboard';
import { CustomerServiceDashboard } from '@/components/CustomerServiceDashboard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CommandCenter } from '@/components/CommandCenter';
import { MonitoringWidgets } from '@/components/MonitoringWidgets';
import { InventoryOperations } from '@/components/InventoryOperations';
import { PricingSalesControl } from '@/components/PricingSalesControl';
import { AdminSystemControls } from '@/components/AdminSystemControls';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { UserManagementPanel } from '@/components/UserManagementPanel';
import { ExportReports } from '@/components/ExportReports';
import { OperationsAssistant } from '@/components/OperationsAssistant';
import { SupplierManager } from '@/components/SupplierManager';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useRBAC } from '@/hooks/useRBAC';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Box, TrendingUp, Users, CalendarX, BarChart3, Truck } from 'lucide-react';
import { ExpiryWastageDashboard } from '@/components/ExpiryWastageDashboard';
import { useAutoExpiryWatcher } from '@/hooks/useAutoExpiryWatcher';

const Index = () => {
  const [time, setTime] = useState(new Date());
  useSessionTimeout();
  useAutoExpiryWatcher();
  const { role } = useRBAC();
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg scanlines">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Role Badge */}
        <div className="flex justify-end">
          <Badge variant="outline" className="text-[10px] font-display tracking-wider border-primary/50 text-primary">
            ROLE: {role?.toUpperCase()}
          </Badge>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MonitoringWidgets />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 space-y-4">
            <CommandCenter />
            <InventoryOperations />
            <PricingSalesControl />
            <AdminSystemControls />
            <AgentStatusPanel />
            <SupplierManager />
            <ExportReports />
            <UserManagementPanel />
            {role === 'admin' && <SecurityDashboard />}
          </motion.aside>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-6">
            <div className="glow-card p-4">
              <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-4 bg-muted/30">
                  <TabsTrigger value="inventory" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Box className="h-4 w-4 mr-1" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="expiry" className="font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                    <CalendarX className="h-4 w-4 mr-1" />
                    Expiry
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="font-display text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="customer" className="font-display text-xs data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    Service
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="suppliers" className="font-display text-xs data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
                    <Truck className="h-4 w-4 mr-1" />
                    Supply
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="inventory" className="mt-0"><InventoryDashboard /></TabsContent>
                <TabsContent value="expiry" className="mt-0"><ExpiryWastageDashboard /></TabsContent>
                <TabsContent value="pricing" className="mt-0"><PricingDashboard /></TabsContent>
                <TabsContent value="customer" className="mt-0"><CustomerServiceDashboard /></TabsContent>
                <TabsContent value="analytics" className="mt-0"><AnalyticsDashboard /></TabsContent>
                <TabsContent value="suppliers" className="mt-0"><SupplierManager /></TabsContent>
              </Tabs>
            </div>
          </motion.div>
          
          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 space-y-4">
            <OperationsAssistant />
            <ActivityFeed />
          </motion.aside>
        </div>
        
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center text-xs text-muted-foreground">
          <p className="font-display tracking-wider">AGENTIC AI HYPERMARKET MANAGEMENT SYSTEM</p>
          <p className="text-[10px] mt-1">Multi-Agent Architecture • Real-Time Decision Making • Autonomous Operations</p>
          <p className="text-[10px] mt-2 text-muted-foreground/60">© 2026 Hypermarket AI. All rights reserved.</p>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
