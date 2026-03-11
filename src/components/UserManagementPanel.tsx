import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRBAC } from '@/hooks/useRBAC';
import { Shield, Users, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;

type AppRole = 'admin' | 'operator' | 'viewer' | 'inventory_manager' | 'pricing_manager';

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  role: AppRole;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'border-accent/50 text-accent bg-accent/10',
  operator: 'border-primary/50 text-primary bg-primary/10',
  inventory_manager: 'border-success/50 text-success bg-success/10',
  pricing_manager: 'border-warning/50 text-warning bg-warning/10',
  viewer: 'border-border text-muted-foreground bg-muted/20',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  operator: 'Operator',
  inventory_manager: 'Inventory Mgr',
  pricing_manager: 'Pricing Mgr',
  viewer: 'Viewer',
};

export function UserManagementPanel() {
  const { role } = useRBAC();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all user_roles (admin can see all via RLS)
      const { data: roles, error: rolesError } = await supabaseAny
        .from('user_roles')
        .select('user_id, role, created_at');
      if (rolesError) throw rolesError;

      // Get profiles
      const { data: profiles, error: profilesError } = await supabaseAny
        .from('profiles')
        .select('user_id, display_name');
      if (profilesError) throw profilesError;

      const profileMap = new Map(
        (profiles || []).map((p: { user_id: string; display_name: string | null }) => [p.user_id, p.display_name])
      );

      return (roles || []).map((r: { user_id: string; role: AppRole; created_at: string }) => ({
        user_id: r.user_id,
        role: r.role,
        created_at: r.created_at,
        display_name: profileMap.get(r.user_id) || 'Unknown',
      })) as UserWithRole[];
    },
    enabled: role === 'admin',
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabaseAny
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated successfully');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update role: ${err.message}`);
    },
  });

  if (role !== 'admin') return null;

  return (
    <div className="glow-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs tracking-wider text-primary">USER MANAGEMENT</h3>
        <Badge variant="outline" className="ml-auto text-[9px] border-primary/30 text-primary">
          {users?.length ?? 0} users
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {users?.map(user => (
              <div
                key={user.user_id}
                className="flex items-center gap-2 p-2 rounded-md bg-card/50 border border-border/30 hover:border-border/60 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-display text-primary">
                    {(user.display_name || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.display_name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    ID: {user.user_id.slice(0, 8)}…
                  </p>
                </div>
                <Select
                  value={user.role}
                  onValueChange={(val) => updateRole.mutate({ userId: user.user_id, newRole: val as AppRole })}
                >
                  <SelectTrigger className={cn('h-7 w-[120px] text-[10px] font-display', ROLE_COLORS[user.role])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
