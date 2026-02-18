import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wifi, Database, Shield, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ROLE_COLORS: Record<string, string> = {
  admin: 'text-accent border-accent/50 bg-accent/10',
  operator: 'text-primary border-primary/50 bg-primary/10',
  viewer: 'text-muted-foreground border-border bg-muted/20',
};

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const { authUser, signOut } = useAuth();

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Cpu className="h-6 w-6 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-wider neon-text">
                HYPERMARKET AI
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Autonomous Operations System v2.0
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-success" />
                <span>Connected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="h-3 w-3 text-primary" />
                <span>Synced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-accent" />
                <span>Secure</span>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <div className="font-display text-lg text-primary tabular-nums">
                {currentTime}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                System Time
              </div>
            </div>

            {/* User session menu */}
            {authUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 border border-border/50 hover:border-primary/50">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/50 flex items-center justify-center">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-medium leading-none">{authUser.displayName ?? authUser.user.email?.split('@')[0]}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{authUser.role}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-xs font-medium">{authUser.displayName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{authUser.user.email}</p>
                    <Badge variant="outline" className={`mt-1.5 text-[10px] px-1.5 py-0.5 ${ROLE_COLORS[authUser.role ?? 'viewer']}`}>
                      {authUser.role?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Session</p>
                    <p className="text-[10px] text-muted-foreground">ID: {authUser.user.id.slice(0, 8)}…</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}

