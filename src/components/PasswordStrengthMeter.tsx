import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: Rule[] = [
  { label: 'At least 8 characters', test: pw => pw.length >= 8 },
  { label: 'Contains uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { label: 'Contains lowercase letter', test: pw => /[a-z]/.test(pw) },
  { label: 'Contains a number', test: pw => /\d/.test(pw) },
  { label: 'Contains special character', test: pw => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
];

export function getPasswordScore(password: string): number {
  return RULES.filter(r => r.test(password)).length;
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordScore(password) >= 4;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const score = useMemo(() => getPasswordScore(password), [password]);
  const results = useMemo(() => RULES.map(r => ({ ...r, passed: r.test(password) })), [password]);

  if (!password) return null;

  const percent = (score / RULES.length) * 100;
  const color = score <= 1 ? 'bg-destructive' : score <= 2 ? 'bg-warning' : score <= 3 ? 'bg-accent' : 'bg-success';
  const label = score <= 1 ? 'WEAK' : score <= 2 ? 'FAIR' : score <= 3 ? 'GOOD' : score <= 4 ? 'STRONG' : 'EXCELLENT';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${percent}%` }} />
        </div>
        <span className={cn("text-[9px] font-display tracking-wider", score <= 1 ? 'text-destructive' : score <= 3 ? 'text-warning' : 'text-success')}>
          {label}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {results.map(r => (
          <div key={r.label} className="flex items-center gap-1.5 text-[9px]">
            {r.passed ? <Check className="h-2.5 w-2.5 text-success" /> : <X className="h-2.5 w-2.5 text-muted-foreground/50" />}
            <span className={cn(r.passed ? 'text-success' : 'text-muted-foreground/50')}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
