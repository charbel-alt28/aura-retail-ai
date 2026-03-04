import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSuccess: () => void;
}

export function ReAuthDialog({ open, onOpenChange, title, description, onSuccess }: ReAuthDialogProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReAuth = async () => {
    if (!password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user session');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (authError) {
        setError('Invalid password. Please try again.');
        return;
      }

      setPassword('');
      onOpenChange(false);
      onSuccess();
      toast.success('Re-authenticated successfully');
    } catch {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) { setPassword(''); setError(''); } onOpenChange(v); }}>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-display tracking-wider">
            <Lock className="h-5 w-5 text-warning" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reauth-password" className="text-xs font-display tracking-wider text-muted-foreground">
              ENTER YOUR PASSWORD TO CONTINUE
            </Label>
            <Input
              id="reauth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleReAuth(); }}
              className="bg-muted/30 border-border/50"
            />
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-display text-xs tracking-wider">
            Cancel
          </Button>
          <Button onClick={handleReAuth} disabled={loading} className="font-display text-xs tracking-wider">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
            Authenticate & Proceed
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
