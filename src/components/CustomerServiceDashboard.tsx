import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Send, Bot, User, Smile, Frown, Meh,
  AlertTriangle, Trash2, Zap, ShoppingCart, Clock, CheckCircle,
  ArrowUp, Sparkles, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCustomerChat, ChatMessage, CANNED_TEMPLATES } from '@/hooks/useCustomerChat';

const SENTIMENT_CONFIG = {
  positive: { icon: Smile, color: 'text-success', bg: 'bg-success/20', label: 'Positive' },
  neutral: { icon: Meh, color: 'text-primary', bg: 'bg-primary/20', label: 'Neutral' },
  negative: { icon: Frown, color: 'text-accent', bg: 'bg-accent/20', label: 'Negative' },
  urgent: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/20', label: 'Urgent' },
};

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-2 px-4 py-2"
    >
      <div className="h-7 w-7 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="h-4 w-4 text-success" />
      </div>
      <div className="bg-muted/50 border border-border/50 rounded-xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-success/60"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const sentimentInfo = message.sentiment ? SENTIMENT_CONFIG[message.sentiment] : null;
  const SentimentIcon = sentimentInfo?.icon || Meh;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex items-start gap-2 px-4 py-1.5", isUser ? "flex-row-reverse" : "")}
    >
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "bg-primary/20" : "bg-success/20"
      )}>
        {isUser ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-success" />}
      </div>

      <div className={cn("max-w-[80%] space-y-1.5", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary/20 border border-primary/30 rounded-tr-sm text-foreground"
            : "bg-muted/50 border border-border/50 rounded-tl-sm text-foreground"
        )}>
          {message.content}
        </div>

        {/* Metadata row for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-2 flex-wrap px-1">
            <span className="text-[10px] text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {sentimentInfo && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1", sentimentInfo.bg, sentimentInfo.color)}>
                <SentimentIcon className="h-3 w-3" />
                {sentimentInfo.label}
                {message.sentimentScore !== undefined && ` (${message.sentimentScore})`}
              </span>
            )}
            {message.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground">
                {message.category.replace(/_/g, ' ')}
              </span>
            )}
            {message.resolved && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success flex items-center gap-0.5">
                <CheckCircle className="h-3 w-3" /> Resolved
              </span>
            )}
            {message.escalationNeeded && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3" /> Escalated
              </span>
            )}
          </div>
        )}

        {/* Suggested Products */}
        {!isUser && message.suggestedProducts && message.suggestedProducts.length > 0 && (
          <div className="px-1 space-y-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" /> Suggested:
            </span>
            {message.suggestedProducts.map((sp, i) => (
              <div key={i} className="text-[11px] bg-card/80 border border-border/30 rounded-lg px-2.5 py-1.5">
                <span className="font-medium text-primary">{sp.name}</span>
                <span className="text-muted-foreground"> — {sp.reason}</span>
              </div>
            ))}
          </div>
        )}

        {isUser && (
          <span className="text-[10px] text-muted-foreground px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function CustomerServiceDashboard() {
  const {
    messages, isTyping, customerName, setCustomerName,
    sendMessage, clearChat, sentimentStats,
  } = useCustomerChat();

  const [inputText, setInputText] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleTemplate = (template: typeof CANNED_TEMPLATES[0]) => {
    setInputText(template.message);
    inputRef.current?.focus();
  };

  const totalSentiment = sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative + sentimentStats.urgent;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-success flex items-center gap-2">
          <Users className="h-5 w-5" />
          AI CUSTOMER SERVICE
        </h2>
        {messages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clearChat} className="text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <div className="metric-card success">
          <p className="text-[10px] text-muted-foreground mb-0.5">Resolved</p>
          <p className="text-lg font-display font-bold text-success">
            {messages.filter(m => m.role === 'assistant' && m.resolved).length}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] text-muted-foreground mb-0.5">Messages</p>
          <p className="text-lg font-display font-bold text-primary">{messages.length}</p>
        </div>
        <div className="metric-card accent">
          <p className="text-[10px] text-muted-foreground mb-0.5">Escalated</p>
          <p className="text-lg font-display font-bold text-accent">
            {messages.filter(m => m.escalationNeeded).length}
          </p>
        </div>
        <div className="metric-card warning">
          <p className="text-[10px] text-muted-foreground mb-0.5">Avg Sentiment</p>
          <p className="text-lg font-display font-bold text-warning">
            {totalSentiment > 0
              ? Math.round(
                  messages
                    .filter(m => m.role === 'assistant' && m.sentimentScore !== undefined)
                    .reduce((sum, m) => sum + (m.sentimentScore || 50), 0) /
                  Math.max(messages.filter(m => m.role === 'assistant' && m.sentimentScore !== undefined).length, 1)
                )
              : '—'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="chat" className="text-xs">
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Live Chat
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <Zap className="h-3.5 w-3.5 mr-1" /> Templates
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="text-xs">
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Sentiment
          </TabsTrigger>
        </TabsList>

        {/* LIVE CHAT TAB */}
        <TabsContent value="chat" className="mt-3 space-y-3">
          {/* Customer name input */}
          {showNameInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-2 items-center"
            >
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-input border-border/50 text-sm h-8"
                onFocus={() => setShowNameInput(true)}
              />
              <Button size="sm" variant="ghost" className="text-[10px] shrink-0" onClick={() => setShowNameInput(false)}>
                OK
              </Button>
            </motion.div>
          )}

          {/* Chat area */}
          <div className="glow-card overflow-hidden" style={{ height: 340 }}>
            <div ref={scrollRef} className="h-full overflow-y-auto py-3 space-y-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-success/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-display">AI Customer Service Agent</p>
                    <p className="text-xs mt-1">Ask about products, policies, delivery, returns...</p>
                    <p className="text-[10px] mt-2 text-muted-foreground/60">
                      Powered by AI • Real-time inventory • Sentiment analysis
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {messages.map(msg => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div className="flex gap-2">
            {!showNameInput && (
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-10 w-10 text-muted-foreground"
                onClick={() => setShowNameInput(true)}
              >
                <User className="h-4 w-4" />
              </Button>
            )}
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="bg-input border-border/50 focus:border-success"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={isTyping || !inputText.trim()}
              className="bg-success hover:bg-success/80 text-success-foreground shrink-0"
            >
              {isTyping ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick template chips */}
          <div className="flex gap-1.5 flex-wrap">
            {CANNED_TEMPLATES.slice(0, 5).map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplate(t)}
                className="text-[10px] px-2 py-1 rounded-full border border-success/30 text-success hover:bg-success/10 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-3">
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {CANNED_TEMPLATES.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glow-card p-3 flex items-center justify-between group cursor-pointer hover:border-success/40 transition-colors"
                onClick={() => handleTemplate(t)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm text-foreground">{t.label}</span>
                    <Badge variant="outline" className="text-[9px] border-border/50">
                      {t.category.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.message}</p>
                </div>
                <ArrowUp className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity rotate-45 shrink-0 ml-2" />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* SENTIMENT TAB */}
        <TabsContent value="sentiment" className="mt-3">
          <div className="space-y-4">
            {/* Sentiment distribution */}
            <div className="glow-card p-4">
              <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Sentiment Distribution
              </h3>
              {totalSentiment === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No conversations yet. Start chatting to see sentiment analysis.
                </p>
              ) : (
                <div className="space-y-3">
                  {(Object.entries(SENTIMENT_CONFIG) as [keyof typeof SENTIMENT_CONFIG, typeof SENTIMENT_CONFIG[keyof typeof SENTIMENT_CONFIG]][]).map(([key, config]) => {
                    const count = sentimentStats[key];
                    const pct = totalSentiment > 0 ? (count / totalSentiment) * 100 : 0;
                    const Icon = config.icon;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn("flex items-center gap-1.5", config.color)}>
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </span>
                          <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            className={cn("h-full rounded-full", config.bg.replace('/20', '/60'))}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent sentiment timeline */}
            <div className="glow-card p-4">
              <h3 className="font-display text-sm text-primary mb-3">Recent Interactions</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {messages.filter(m => m.role === 'assistant').length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No AI responses yet</p>
                ) : (
                  messages
                    .filter(m => m.role === 'assistant')
                    .slice(-10)
                    .reverse()
                    .map(m => {
                      const info = m.sentiment ? SENTIMENT_CONFIG[m.sentiment] : SENTIMENT_CONFIG.neutral;
                      const Icon = info.icon;
                      return (
                        <div key={m.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card/50">
                          <div className={cn("h-6 w-6 rounded-full flex items-center justify-center shrink-0", info.bg)}>
                            <Icon className={cn("h-3.5 w-3.5", info.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-foreground">{m.content.slice(0, 80)}...</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {m.category && <span>• {m.category.replace(/_/g, ' ')}</span>}
                              {m.sentimentScore !== undefined && <span>• Score: {m.sentimentScore}</span>}
                            </p>
                          </div>
                          {m.resolved && <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />}
                          {m.escalationNeeded && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
