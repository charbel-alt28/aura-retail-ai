import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg scanlines">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Monitoring Widgets Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <MonitoringWidgets />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Agent Status & Commands */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-4"
          >
            <CommandCenter />
            <InventoryOperations />
            <PricingSalesControl />
            <AdminSystemControls />
            <AgentStatusPanel />
          </motion.aside>
          
          {/* Main Content - Agent Dashboards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="glow-card p-4">
              <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30 mb-4">
                  <TabsTrigger 
                    value="inventory" 
                    className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Box className="h-4 w-4 mr-2" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pricing"
                    className="font-display text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="customer"
                    className="font-display text-xs data-[state=active]:bg-success data-[state=active]:text-success-foreground"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Service
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="inventory" className="mt-0">
                  <InventoryDashboard />
                </TabsContent>
                
                <TabsContent value="pricing" className="mt-0">
                  <PricingDashboard />
                </TabsContent>
                
                <TabsContent value="customer" className="mt-0">
                  <CustomerServiceDashboard />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
          
          {/* Right Sidebar - Activity Feed */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <ActivityFeed />
          </motion.aside>
        </div>
        
        {/* Footer Stats */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          <p className="font-display tracking-wider">
            AGENTIC AI HYPERMARKET MANAGEMENT SYSTEM
          </p>
          <p className="text-[10px] mt-1">
            Multi-Agent Architecture • Real-Time Decision Making • Autonomous Operations
          </p>
          <p className="text-[10px] mt-2 text-muted-foreground/60">
            © 2026 Hypermarket AI. All rights reserved.
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
