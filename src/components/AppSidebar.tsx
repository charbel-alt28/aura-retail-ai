import {
  Box, TrendingUp, Users, CalendarX, BarChart3, Truck,
  Cpu, Settings, Shield, Bot, FileBarChart, UserCog,
  Package, DollarSign, Activity, MessageSquare, ChevronDown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
}

const mainNavItems = [
  { id: 'inventory', label: 'Inventory', icon: Box },
  { id: 'expiry', label: 'Expiry & Wastage', icon: CalendarX },
  { id: 'pricing', label: 'Pricing', icon: TrendingUp },
  { id: 'customer', label: 'Customer Service', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
];

const operationItems = [
  { id: 'command', label: 'Command Center', icon: Cpu },
  { id: 'inv-ops', label: 'Inventory Ops', icon: Package },
  { id: 'pricing-ctrl', label: 'Pricing Control', icon: DollarSign },
  { id: 'agents', label: 'Agent Status', icon: Bot },
];

const adminItems = [
  { id: 'admin-ctrl', label: 'System Controls', icon: Settings },
  { id: 'user-mgmt', label: 'User Management', icon: UserCog },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'reports', label: 'Export Reports', icon: FileBarChart },
];

const assistantItems = [
  { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'activity', label: 'Activity Feed', icon: Activity },
];

export function AppSidebar({ activeTab, onTabChange, activePanel, onPanelChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { role } = useRBAC();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Cpu className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display text-sm tracking-wider text-sidebar-foreground truncate">HYPERMARKET AI</p>
              <p className="text-[9px] text-muted-foreground tracking-wider">v2.0</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-[10px] tracking-widest">DASHBOARDS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => { onTabChange(item.id); onPanelChange(null); }}
                    tooltip={item.label}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Operations */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="font-display text-[10px] tracking-widest cursor-pointer hover:text-sidebar-foreground">
                OPERATIONS
                {!collapsed && <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {operationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activePanel === item.id}
                        onClick={() => onPanelChange(activePanel === item.id ? null : item.id)}
                        tooltip={item.label}
                        className="cursor-pointer"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarSeparator />

        {/* Admin */}
        <Collapsible defaultOpen={role === 'admin'} className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="font-display text-[10px] tracking-widest cursor-pointer hover:text-sidebar-foreground">
                ADMIN
                {!collapsed && <ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems
                    .filter(item => item.id !== 'security' || role === 'admin')
                    .map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activePanel === item.id}
                          onClick={() => onPanelChange(activePanel === item.id ? null : item.id)}
                          tooltip={item.label}
                          className="cursor-pointer"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarSeparator />

        {/* Assistant & Feed */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-[10px] tracking-widest">TOOLS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {assistantItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePanel === item.id}
                    onClick={() => onPanelChange(activePanel === item.id ? null : item.id)}
                    tooltip={item.label}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <div className="px-2 py-1">
            <Badge variant="outline" className="text-[9px] font-display tracking-wider border-primary/50 text-primary w-full justify-center">
              {role?.toUpperCase()}
            </Badge>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
