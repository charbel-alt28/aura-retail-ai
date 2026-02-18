import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [name]: e.target.value }));
      setErrors(er => { const n = { ...er }; delete n[name]; return n; });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach(err => { if (err.path[0]) errs[String(err.path[0])] = err.message; });
      setErrors(errs);
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(form.password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success('Password updated successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent mb-4">
            <Cpu className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl tracking-wider neon-text">HYPERMARKET AI</h1>
        </div>
        <div className="glow-card p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-success/20 border border-success/50 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-success" />
              </div>
              <h2 className="font-display text-lg tracking-wider">PASSWORD UPDATED</h2>
              <p className="text-sm text-muted-foreground">Your password has been reset. You can now return to the login screen.</p>
              <Button asChild className="w-full font-display tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <a href="/">RETURN TO SYSTEM</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="font-display text-lg tracking-wider">SET NEW PASSWORD</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a strong password for your account</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" className="pl-9 pr-9 bg-input border-border/70 font-mono text-sm" {...field('password')} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPw ? 'text' : 'password'} placeholder="Re-enter password" className="pl-9 bg-input border-border/70 font-mono text-sm" {...field('confirmPassword')} autoComplete="new-password" />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full font-display tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'UPDATE PASSWORD'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
