import { motion } from 'framer-motion';
import { AIResult, AIAction } from '@/hooks/useAIAutomation';
import { X, TrendingUp, AlertTriangle, Package, Lightbulb, ShieldAlert, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCallback } from 'react';

interface AIResultsPanelProps {
  result: AIResult | null;
  onClose: () => void;
}

function buildPlainTextReport(result: AIResult): string {
  const r = result.result;
  const titles: Record<AIAction, string> = {
    optimize: 'AI OPTIMIZATION REPORT',
    forecast: 'DEMAND FORECAST REPORT',
    anomaly: 'ANOMALY DETECTION REPORT',
    recommendations: 'SMART RECOMMENDATIONS REPORT',
  };

  const lines: string[] = [];
  const hr = '═'.repeat(60);
  const divider = '─'.repeat(60);

  lines.push(hr);
  lines.push(`  ${titles[result.action]}`);
  lines.push(`  Generated: ${result.timestamp.toLocaleString()}`);
  lines.push(hr);
  lines.push('');

  if (r.summary) {
    lines.push('SUMMARY');
    lines.push(divider);
    lines.push(r.summary);
    lines.push('');
  }

  const scores: string[] = [];
  if (r.score != null) scores.push(`Optimization Score: ${r.score}/100`);
  if (r.confidenceScore != null) scores.push(`Confidence Score: ${r.confidenceScore}%`);
  if (r.riskScore != null) scores.push(`Risk Score: ${r.riskScore}/100`);
  if (scores.length) {
    lines.push('SCORES');
    lines.push(divider);
    scores.forEach(s => lines.push(`  • ${s}`));
    lines.push('');
  }

  if (r.priceAdjustments?.length > 0) {
    lines.push('PRICE ADJUSTMENTS');
    lines.push(divider);
    r.priceAdjustments.forEach((a: any) => {
      lines.push(`  ${a.name}: $${a.currentPrice} → $${a.suggestedPrice}`);
      if (a.reason) lines.push(`    Reason: ${a.reason}`);
    });
    lines.push('');
  }

  if (r.restockAlerts?.length > 0) {
    lines.push('RESTOCK ALERTS');
    lines.push(divider);
    r.restockAlerts.forEach((a: any) => {
      lines.push(`  [${(a.urgency || '').toUpperCase()}] ${a.name} — Current: ${a.currentStock}, Order: ${a.suggestedOrder}`);
    });
    lines.push('');
  }

  if (r.recommendations?.length > 0) {
    lines.push('RECOMMENDATIONS');
    lines.push(divider);
    r.recommendations.forEach((rec: string, i: number) => lines.push(`  ${i + 1}. ${rec}`));
    lines.push('');
  }

  if (r.weeklyForecast?.length > 0) {
    lines.push('WEEKLY FORECAST');
    lines.push(divider);
    r.weeklyForecast.forEach((f: any) => {
      lines.push(`  ${f.name}: ${f.predictedDemand}/day (${f.trend} trend, ${f.confidence}% confidence)`);
    });
    lines.push('');
  }

  if (r.topMovers?.length > 0) {
    lines.push('TOP MOVERS');
    lines.push(divider);
    r.topMovers.forEach((m: any) => lines.push(`  ${m.name}: ${m.change}`));
    lines.push('');
  }

  if (r.anomalies?.length > 0) {
    lines.push('DETECTED ANOMALIES');
    lines.push(divider);
    r.anomalies.forEach((a: any) => {
      lines.push(`  [${(a.severity || '').toUpperCase()}] ${a.name} (${a.type})`);
      lines.push(`    ${a.description}`);
    });
    lines.push('');
  }

  if (r.bundles?.length > 0) {
    lines.push('BUNDLE PROMOTIONS');
    lines.push(divider);
    r.bundles.forEach((b: any) => {
      lines.push(`  ${b.products.join(' + ')} — ${b.discount}`);
      lines.push(`    ${b.reason}`);
    });
    lines.push('');
  }

  if (r.markdowns?.length > 0) {
    lines.push('MARKDOWN CANDIDATES');
    lines.push(divider);
    r.markdowns.forEach((m: any) => {
      lines.push(`  ${m.name}: ${m.suggestedDiscount}`);
      if (m.reason) lines.push(`    ${m.reason}`);
    });
    lines.push('');
  }

  if (r.upsells?.length > 0) {
    lines.push('UPSELL OPPORTUNITIES');
    lines.push(divider);
    r.upsells.forEach((u: any) => lines.push(`  ${u.name}: ${u.strategy}`));
    lines.push('');
  }

  if (r.seasonal?.length > 0) {
    lines.push('SEASONAL STRATEGIES');
    lines.push(divider);
    r.seasonal.forEach((s: string) => lines.push(`  • ${s}`));
    lines.push('');
  }

  lines.push(hr);
  lines.push('  End of Report');
  lines.push(hr);

  return lines.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AIResultsPanel({ result, onClose }: AIResultsPanelProps) {
  const handleDownloadTxt = useCallback(() => {
    if (!result) return;
    const text = buildPlainTextReport(result);
    const filename = `ai-${result.action}-report-${result.timestamp.toISOString().slice(0, 10)}.txt`;
    downloadFile(text, filename, 'text/plain;charset=utf-8');
  }, [result]);

  const handleDownloadDocx = useCallback(() => {
    if (!result) return;
    const text = buildPlainTextReport(result);
    // Build a minimal .doc (Word-compatible HTML) file
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>AI Report</title>
<style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;line-height:1.6;color:#222}pre{font-family:'Consolas','Courier New',monospace;font-size:10pt;white-space:pre-wrap;background:#f5f5f5;padding:16px;border-radius:4px}</style>
</head><body><pre>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`;
    const filename = `ai-${result.action}-report-${result.timestamp.toISOString().slice(0, 10)}.doc`;
    downloadFile(html, filename, 'application/msword');
  }, [result]);

  if (!result) return null;

  const icons: Record<AIAction, React.ReactNode> = {
    optimize: <TrendingUp className="h-5 w-5 text-primary" />,
    forecast: <Package className="h-5 w-5 text-accent" />,
    anomaly: <ShieldAlert className="h-5 w-5 text-destructive" />,
    recommendations: <Lightbulb className="h-5 w-5 text-warning" />,
  };

  const titles: Record<AIAction, string> = {
    optimize: 'AI OPTIMIZATION',
    forecast: 'DEMAND FORECAST',
    anomaly: 'ANOMALY DETECTION',
    recommendations: 'SMART RECOMMENDATIONS',
  };

  const r = result.result;

  return (
    <Sheet open={!!result} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[520px] md:w-[600px] bg-card border-border p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
              {icons[result.action]}
              {titles[result.action]}
            </SheetTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1.5 border-border/50"
                onClick={handleDownloadTxt}
              >
                <FileText className="h-3.5 w-3.5" />
                .txt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1.5 border-border/50"
                onClick={handleDownloadDocx}
              >
                <Download className="h-3.5 w-3.5" />
                .doc
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            Generated {result.timestamp.toLocaleString()}
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-4 text-[12px]">
            {/* Summary */}
            {r.summary && (
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                <p className="text-foreground/90 leading-relaxed text-[13px]">{r.summary}</p>
              </div>
            )}

            {/* Score badges */}
            <div className="flex gap-2 flex-wrap">
              {r.score != null && (
                <span className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                  r.score >= 70 ? "status-success" : r.score >= 40 ? "status-warning" : "status-critical"
                )}>
                  Score: {r.score}/100
                </span>
              )}
              {r.confidenceScore != null && (
                <span className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                  r.confidenceScore >= 70 ? "status-success" : "status-warning"
                )}>
                  Confidence: {r.confidenceScore}%
                </span>
              )}
              {r.riskScore != null && (
                <span className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                  r.riskScore <= 30 ? "status-success" : r.riskScore <= 60 ? "status-warning" : "status-critical"
                )}>
                  Risk: {r.riskScore}/100
                </span>
              )}
            </div>

            {/* Price Adjustments */}
            {r.priceAdjustments?.length > 0 && (
              <Section title="Price Adjustments">
                {r.priceAdjustments.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded-md px-3 py-2 mb-1">
                    <div>
                      <span className="text-foreground/90 font-medium">{a.name}</span>
                      {a.reason && <p className="text-muted-foreground text-[10px] mt-0.5">{a.reason}</p>}
                    </div>
                    <span className="font-bold text-primary whitespace-nowrap ml-2">${a.currentPrice} → ${a.suggestedPrice}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Restock Alerts */}
            {r.restockAlerts?.length > 0 && (
              <Section title="Restock Alerts">
                {r.restockAlerts.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded-md px-3 py-2 mb-1">
                    <div>
                      <span className="text-foreground/90 font-medium">{a.name}</span>
                      <p className="text-muted-foreground text-[10px]">Current: {a.currentStock} → Order: {a.suggestedOrder}</p>
                    </div>
                    <span className={cn("font-bold text-[10px] px-2 py-0.5 rounded",
                      a.urgency === 'critical' ? 'status-critical' : a.urgency === 'warning' ? 'status-warning' : 'status-success'
                    )}>{a.urgency}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Recommendations */}
            {r.recommendations?.length > 0 && (
              <Section title="Recommendations">
                <ul className="space-y-1.5">
                  {r.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80 bg-muted/20 rounded-md px-3 py-2">
                      <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Forecast */}
            {r.weeklyForecast?.length > 0 && (
              <Section title="Weekly Forecast">
                {r.weeklyForecast.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded-md px-3 py-2 mb-1">
                    <span className="text-foreground/90 font-medium">{f.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{f.predictedDemand}/day</span>
                      <span className="text-[10px] text-muted-foreground">{f.confidence}%</span>
                      <span className={cn("text-sm",
                        f.trend === 'up' ? 'text-success' : f.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Top Movers */}
            {r.topMovers?.length > 0 && (
              <Section title="Top Movers">
                {r.topMovers.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded-md px-3 py-2 mb-1">
                    <span className="text-foreground/90 font-medium">{m.name}</span>
                    <span className="text-accent font-bold">{m.change}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Anomalies */}
            {r.anomalies?.length > 0 && (
              <Section title="Detected Anomalies">
                {r.anomalies.map((a: any, i: number) => (
                  <div key={i} className="bg-muted/20 rounded-md px-3 py-2.5 mb-1 border-l-2 border-destructive/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground/90">{a.name}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                        a.severity === 'high' ? 'status-critical' : a.severity === 'medium' ? 'status-warning' : 'status-success'
                      )}>{a.severity}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-1">{a.description}</p>
                  </div>
                ))}
              </Section>
            )}

            {/* Bundles */}
            {r.bundles?.length > 0 && (
              <Section title="Bundle Promotions">
                {r.bundles.map((b: any, i: number) => (
                  <div key={i} className="bg-muted/20 rounded-md px-3 py-2.5 mb-1">
                    <p className="font-semibold text-foreground/90">{b.products.join(' + ')}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{b.discount} — {b.reason}</p>
                  </div>
                ))}
              </Section>
            )}

            {/* Markdowns */}
            {r.markdowns?.length > 0 && (
              <Section title="Markdown Candidates">
                {r.markdowns.map((m: any, i: number) => (
                  <div key={i} className="bg-muted/20 rounded-md px-3 py-2 mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/90 font-medium">{m.name}</span>
                      <span className="text-accent font-bold">{m.suggestedDiscount}</span>
                    </div>
                    {m.reason && <p className="text-muted-foreground text-[10px] mt-0.5">{m.reason}</p>}
                  </div>
                ))}
              </Section>
            )}

            {/* Upsells */}
            {r.upsells?.length > 0 && (
              <Section title="Upsell Opportunities">
                {r.upsells.map((u: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded-md px-3 py-2 mb-1">
                    <span className="text-foreground/90 font-medium">{u.name}</span>
                    <span className="text-muted-foreground text-[11px]">{u.strategy}</span>
                  </div>
                ))}
              </Section>
            )}


            {/* Raw/fallback content */}
            {r.raw && !r.summary && (
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                <p className="text-foreground/90 leading-relaxed text-[13px] whitespace-pre-wrap">{JSON.stringify(r, null, 2)}</p>
              </div>
            )}

            {/* Empty state */}
            {!r.summary && !r.raw && !r.anomalies?.length && !r.priceAdjustments?.length && 
             !r.restockAlerts?.length && !r.recommendations?.length && !r.weeklyForecast?.length &&
             !r.bundles?.length && !r.markdowns?.length && !r.upsells?.length && !r.seasonal?.length && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No detailed results available for this analysis.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display text-[11px] text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}
