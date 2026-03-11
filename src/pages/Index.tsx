import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { AppSidebar } from '@/components/AppSidebar';
import { MonitoringWidgets } from '@/components/MonitoringWidgets';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import { PricingDashboard } from '@/components/PricingDashboard';
import { CustomerServiceDashboard } from '@/components/CustomerServiceDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ExpiryWastageDashboard } from '@/components/ExpiryWastageDashboard';
import { SupplierManager } from '@/components/SupplierManager';
import { CommandCenter } from '@/components/CommandCenter';
import { InventoryOperations } from '@/components/InventoryOperations';
import { PricingSalesControl } from '@/components/PricingSalesControl';
import { AgentStatusPanel } from '@/components/AgentStatusPanel';
import { AdminSystemControls } from '@/components/AdminSystemControls';
import { UserManagementPanel } from '@/components/UserManagementPanel';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { ExportReports } from '@/components/ExportReports';
import { OperationsAssistant } from '@/components/OperationsAssistant';
import { ActivityFeed } from '@/components/ActivityFeed';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAutoExpiryWatcher } from '@/hooks/useAutoExpiryWatcher';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('inventory');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  useSessionTimeout();
  useAutoExpiryWatcher();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderDashboard = () => {
    switch (activeTab) {
      case 'inventory': return <InventoryDashboard />;
      case 'expiry': return <ExpiryWastageDashboard />;
      case 'pricing': return <PricingDashboard />;
      case 'customer': return <CustomerServiceDashboard />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'suppliers': return <SupplierManager />;
      default: return <InventoryDashboard />;
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'command': return <CommandCenter />;
      case 'inv-ops': return <InventoryOperations />;
      case 'pricing-ctrl': return <PricingSalesControl />;
      case 'agents': return <AgentStatusPanel />;
      case 'admin-ctrl': return <AdminSystemControls />;
      case 'user-mgmt': return <UserManagementPanel />;
      case 'security': return <SecurityDashboard />;
      case 'reports': return <ExportReports />;
      case 'ai-assistant': return <OperationsAssistant />;
      case 'activity': return <ActivityFeed />;
      default: return null;
    }
  };

  const panelLabels: Record<string, string> = {
    'command': 'Command Center',
    'inv-ops': 'Inventory Operations',
    'pricing-ctrl': 'Pricing Control',
    'agents': 'Agent Status',
    'admin-ctrl': 'System Controls',
    'user-mgmt': 'User Management',
    'security': 'Security',
    'reports': 'Export Reports',
    'ai-assistant': 'AI Assistant',
    'activity': 'Activity Feed',
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          {/* Toolbar with sidebar trigger */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-card/30">
            <SidebarTrigger />
            <span className="text-xs text-muted-foreground font-display tracking-wider uppercase">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          <main className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <MonitoringWidgets />
              </motion.div>

              <div className="flex gap-4">
                {/* Main Dashboard Content */}
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="glow-card p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderDashboard()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Side Panel (operations/admin/tools) */}
                <AnimatePresence>
                  {activePanel && (
                    <motion.div
                      className="w-[380px] shrink-0"
                      initial={{ opacity: 0, x: 20, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 380 }}
                      exit={{ opacity: 0, x: 20, width: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="glow-card p-4 sticky top-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display text-xs tracking-wider text-primary uppercase">
                            {panelLabels[activePanel]}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setActivePanel(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {renderPanel()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>

          <footer className="py-3 text-center text-xs text-muted-foreground border-t border-border/50 bg-card/20">
            <p className="font-display tracking-wider text-[10px]">AGENTIC AI HYPERMARKET MANAGEMENT SYSTEM</p>
            <p className="text-[9px] mt-0.5 text-muted-foreground/60">© 2026 Hypermarket AI</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
