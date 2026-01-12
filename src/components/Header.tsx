import { motion } from 'framer-motion';
import { Cpu, Wifi, Database, Shield } from 'lucide-react';

export function Header() {
  const currentTime = new Date().toLocaleTimeString();
  
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
            className="flex items-center gap-6"
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
            
            <div className="text-right">
              <div className="font-display text-lg text-primary tabular-nums">
                {currentTime}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                System Time
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
