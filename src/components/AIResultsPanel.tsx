import { motion, AnimatePresence } from 'framer-motion';
import { AIResult, AIAction } from '@/hooks/useAIAutomation';
import { X, TrendingUp, AlertTriangle, Package, Lightbulb, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIResultsPanelProps {
  result: AIResult | null;
  onClose: () => void;
}

export function AIResultsPanel({ result, onClose }: AIResultsPanelProps) {
  if (!result) return null;

  const icons: Record<AIAction, React.ReactNode> = {
    optimize: <TrendingUp className="h-4 w-4 text-primary" />,
    forecast: <Package className="h-4 w-4 text-accent" />,
    anomaly: <ShieldAlert className="h-4 w-4 text-destructive" />,
    recommendations: <Lightbulb className="h-4 w-4 text-warning" />,
  };

  const titles: Record<AIAction, string> = {
    optimize: 'AI OPTIMIZATION',
    forecast: 'DEMAND FORECAST',
    anomaly: 'ANOMALY DETECTION',
    recommendations: 'SMART RECOMMENDATIONS',
  };

  const r = result.result;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="glow-card p-3 mt-3"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-[11px] tracking-wider text-primary flex items-center gap-1.5">
            {icons[result.action]}
            {titles[result.action]}
          </h3>
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2 text-[11px]">
            {/* Summary */}
            {r.summary && (
              <div className="bg-muted/30 border border-border/50 rounded-md p-2">
                <p className="text-foreground/90 leading-relaxed">{r.summary}</p>
              </div>
            )}

            {/* Score badges */}
            <div className="flex gap-2 flex-wrap">
              {r.score != null && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  r.score >= 70 ? "status-success" : r.score >= 40 ? "status-warning" : "status-critical"
                )}>
                  Score: {r.score}/100
                </span>
              )}
              {r.confidenceScore != null && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  r.confidenceScore >= 70 ? "status-success" : "status-warning"
                )}>
                  Confidence: {r.confidenceScore}%
                </span>
              )}
              {r.riskScore != null && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  r.riskScore <= 30 ? "status-success" : r.riskScore <= 60 ? "status-warning" : "status-critical"
                )}>
                  Risk: {r.riskScore}/100
                </span>
              )}
            </div>

            {/* Price Adjustments */}
            {r.priceAdjustments?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Price Adjustments</p>
                {r.priceAdjustments.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1 mb-0.5">
                    <span className="text-foreground/80">{a.name}</span>
                    <span className="font-bold text-primary">${a.currentPrice} → ${a.suggestedPrice}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Restock Alerts */}
            {r.restockAlerts?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Restock Alerts</p>
                {r.restockAlerts.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1 mb-0.5">
                    <span className="text-foreground/80">{a.name}</span>
                    <span className={cn("font-bold text-[10px] px-1.5 rounded", 
                      a.urgency === 'critical' ? 'status-critical' : a.urgency === 'warning' ? 'status-warning' : 'status-success'
                    )}>{a.urgency}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {r.recommendations?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Recommendations</p>
                <ul className="space-y-0.5">
                  {r.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-foreground/80">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Forecast */}
            {r.weeklyForecast?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Weekly Forecast</p>
                {r.weeklyForecast.slice(0, 8).map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1 mb-0.5">
                    <span className="text-foreground/80">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{f.predictedDemand}/day</span>
                      <span className={cn("text-[9px]",
                        f.trend === 'up' ? 'text-success' : f.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top Movers */}
            {r.topMovers?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top Movers</p>
                {r.topMovers.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1 mb-0.5">
                    <span className="text-foreground/80">{m.name}</span>
                    <span className="text-accent font-bold">{m.change}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Anomalies */}
            {r.anomalies?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Detected Anomalies</p>
                {r.anomalies.map((a: any, i: number) => (
                  <div key={i} className="bg-muted/20 rounded px-2 py-1.5 mb-0.5 border-l-2 border-destructive/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground/90">{a.name}</span>
                      <span className={cn("text-[9px] px-1.5 rounded font-bold uppercase",
                        a.severity === 'high' ? 'status-critical' : a.severity === 'medium' ? 'status-warning' : 'status-success'
                      )}>{a.severity}</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{a.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bundles */}
            {r.bundles?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bundle Promotions</p>
                {r.bundles.map((b: any, i: number) => (
                  <div key={i} className="bg-muted/20 rounded px-2 py-1.5 mb-0.5">
                    <p className="font-semibold text-foreground/90">{b.products.join(' + ')}</p>
                    <p className="text-muted-foreground text-[10px]">{b.discount} — {b.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Markdowns */}
            {r.markdowns?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Markdown Candidates</p>
                {r.markdowns.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 rounded px-2 py-1 mb-0.5">
                    <span className="text-foreground/80">{m.name}</span>
                    <span className="text-accent font-bold text-[10px]">{m.suggestedDiscount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Seasonal */}
            {r.seasonal?.length > 0 && (
              <div>
                <p className="font-display text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Seasonal Strategies</p>
                <ul className="space-y-0.5">
                  {r.seasonal.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-foreground/80">
                      <span className="text-warning mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <p className="text-[9px] text-muted-foreground/50 mt-2 text-right">
          Generated {result.timestamp.toLocaleTimeString()}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
