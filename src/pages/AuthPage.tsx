import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Cpu, Lock, Mail, User, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

type Mode = 'login' | 'signup' | 'forgot';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const forgotSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuthContext();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isLocked = lockedUntil && Date.now() < lockedUntil;
  const lockSecondsLeft = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [name]: e.target.value }));
      setErrors(er => { const n = { ...er }; delete n[name]; return n; });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach(err => { if (err.path[0]) errs[String(err.path[0])] = err.message; });
      setErrors(errs);
      return;
    }

    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    setLoading(false);

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        const lockTime = Date.now() + 30_000; // 30s lockout
        setLockedUntil(lockTime);
        setAttempts(0);
        toast.error('Too many failed attempts. Locked for 30 seconds.');
        // Auto-unlock
        setTimeout(() => setLockedUntil(null), 30_000);
      } else {
        toast.error(`Authentication failed: ${error.message}`);
      }
    } else {
      setAttempts(0);
      toast.success('Authenticated successfully');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach(err => { if (err.path[0]) errs[String(err.path[0])] = err.message; });
      setErrors(errs);
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(form.email, form.password, form.displayName);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (data.session) {
      toast.success('Account created and signed in!');
    } else {
      toast.success('Account created! Please check your email to verify your address.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotSchema.safeParse(form);
    if (!parsed.success) {
      setErrors({ email: parsed.error.errors[0]?.message ?? 'Invalid email' });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(form.email);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent to your email.');
      setMode('login');
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setForm({ displayName: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-background grid-bg scanlines flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent mb-4 relative">
            <Cpu className="w-8 h-8 text-primary-foreground" />
            <motion.div
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-success"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <h1 className="font-display text-2xl tracking-wider neon-text">HYPERMARKET AI</h1>
          <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
            Autonomous Operations System v2.0
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glow-card p-8"
        >
          {/* Security badges */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3 text-success" />
              <span>ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3 text-primary" />
              <span>RBAC PROTECTED</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span>AUDIT LOGGED</span>
            </div>
          </div>

          {/* Rate limit warning */}
          {attempts >= 3 && !isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg border border-warning/50 bg-warning/10 text-warning text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Warning: {5 - attempts} attempt(s) remaining before lockout.</span>
            </motion.div>
          )}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2"
            >
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Account temporarily locked. Try again in {lockSecondsLeft}s.</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* LOGIN */}
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">SYSTEM ACCESS</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Authenticate to enter the command center</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs tracking-wider uppercase text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="operator@system.ai" className="pl-9 bg-input border-border/70 font-mono text-sm" {...field('email')} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs tracking-wider uppercase text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9 bg-input border-border/70 font-mono text-sm" {...field('password')} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" disabled={loading || !!isLocked} className="w-full font-display tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'AUTHENTICATE'}
                </Button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => switchMode('forgot')} className="text-muted-foreground hover:text-primary transition-colors">Forgot password?</button>
                  <button type="button" onClick={() => switchMode('signup')} className="text-primary hover:text-primary/80 transition-colors">Create account →</button>
                </div>
              </motion.form>
            )}

            {/* SIGNUP */}
            {mode === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">CREATE ACCOUNT</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Register a new operator account</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="text" placeholder="John Operator" className="pl-9 bg-input border-border/70 font-mono text-sm" {...field('displayName')} autoComplete="name" />
                  </div>
                  {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="operator@system.ai" className="pl-9 bg-input border-border/70 font-mono text-sm" {...field('email')} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" className="pl-9 pr-9 bg-input border-border/70 font-mono text-sm" {...field('password')} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" className="pl-9 pr-9 bg-input border-border/70 font-mono text-sm" {...field('confirmPassword')} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" disabled={loading} className="w-full font-display tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'REGISTER ACCOUNT'}
                </Button>
                <div className="text-center text-xs">
                  <button type="button" onClick={() => switchMode('login')} className="text-muted-foreground hover:text-primary transition-colors">← Back to login</button>
                </div>
              </motion.form>
            )}

            {/* FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleForgot}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-lg tracking-wider text-foreground">RESET PASSWORD</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">We'll send a reset link to your email</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="your@email.com" className="pl-9 bg-input border-border/70 font-mono text-sm" {...field('email')} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" disabled={loading} className="w-full font-display tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEND RESET LINK'}
                </Button>
                <div className="text-center text-xs">
                  <button type="button" onClick={() => switchMode('login')} className="text-muted-foreground hover:text-primary transition-colors">← Back to login</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-[10px] text-muted-foreground mt-4 tracking-wider">
          ALL ACCESS ATTEMPTS ARE LOGGED AND MONITORED
        </p>
      </div>
    </div>
  );
}
