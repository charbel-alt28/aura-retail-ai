import { useAuthContext } from '@/contexts/AuthContext';

export type Permission =
  | 'run_ai_optimization'
  | 'modify_stock'
  | 'modify_prices'
  | 'delete_product'
  | 'export_database'
  | 'backup_database'
  | 'manage_agents'
  | 'view_audit_logs'
  | 'toggle_simulation'
  | 'launch_promotion'
  | 'bulk_restock';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'run_ai_optimization', 'modify_stock', 'modify_prices', 'delete_product',
    'export_database', 'backup_database', 'manage_agents', 'view_audit_logs',
    'toggle_simulation', 'launch_promotion', 'bulk_restock',
  ],
  operator: [
    'modify_stock', 'modify_prices', 'manage_agents', 'launch_promotion', 'bulk_restock',
  ],
  viewer: [],
};

export function useRBAC() {
  const { authUser } = useAuthContext();
  const role = authUser?.role ?? 'viewer';

  const hasPermission = (perm: Permission): boolean => {
    return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
  };

  const canAccess = (...perms: Permission[]): boolean => {
    return perms.some(p => hasPermission(p));
  };

  return { role, hasPermission, canAccess };
}
