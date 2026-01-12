import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, CheckCircle, Clock, Send, HelpCircle } from 'lucide-react';
import { useHypermarketStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqResponses: Record<string, string> = {
  'return': 'Items can be returned within 30 days with receipt for a full refund.',
  'hours': 'We are open Monday-Sunday: 8AM-10PM.',
  'delivery': 'Free delivery on orders over $50. Same-day delivery available for orders before 2PM.',
  'payment': 'We accept cash, credit cards, Apple Pay, and Google Pay.',
  'loyalty': 'Join our rewards program for 5% cashback on all purchases!',
};

export function CustomerServiceDashboard() {
  const { queries, addQuery } = useHypermarketStore();
  const [customerName, setCustomerName] = useState('');
  const [queryText, setQueryText] = useState('');
  
  const resolvedCount = queries.filter(q => q.status === 'resolved').length;
  const pendingCount = queries.filter(q => q.status === 'pending').length;
  
  const handleSubmitQuery = () => {
    if (!customerName.trim() || !queryText.trim()) return;
    
    // Simple keyword matching for auto-response
    const lowerQuery = queryText.toLowerCase();
    let response = 'Thank you for your query. Our team will respond within 24 hours.';
    let status: 'resolved' | 'pending' = 'pending';
    let queryType = 'general';
    
    for (const [key, value] of Object.entries(faqResponses)) {
      if (lowerQuery.includes(key)) {
        response = value;
        status = 'resolved';
        queryType = key;
        break;
      }
    }
    
    addQuery({
      customerName,
      queryType,
      query: queryText,
      response,
      status
    });
    
    setCustomerName('');
    setQueryText('');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wider text-success flex items-center gap-2">
          <Users className="h-5 w-5" />
          CUSTOMER SERVICE
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="metric-card success">
          <p className="text-xs text-muted-foreground mb-1">Resolved</p>
          <p className="text-xl font-display font-bold text-success">{resolvedCount}</p>
        </div>
        <div className="metric-card warning">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-xl font-display font-bold text-warning">{pendingCount}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-xl font-display font-bold text-primary">{queries.length}</p>
        </div>
      </div>
      
      {/* Query Form */}
      <div className="glow-card p-4 mb-4">
        <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          New Query
        </h3>
        <div className="space-y-2">
          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-background border-border/50 focus:border-primary"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Enter query (try: return, delivery, hours)"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuery()}
              className="bg-background border-border/50 focus:border-primary"
            />
            <Button
              onClick={handleSubmitQuery}
              className="bg-success hover:bg-success/80 text-success-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick FAQ buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          Quick:
        </span>
        {Object.keys(faqResponses).map((key) => (
          <Button
            key={key}
            size="sm"
            variant="outline"
            className="text-xs border-success/30 text-success hover:bg-success/10"
            onClick={() => {
              if (!customerName.trim()) setCustomerName('Guest');
              setQueryText(`What about ${key}?`);
            }}
          >
            {key}
          </Button>
        ))}
      </div>
      
      {/* Query List */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
        <AnimatePresence>
          {queries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No queries yet</p>
            </div>
          ) : (
            queries.map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
                className="glow-card p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{query.customerName}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1",
                      query.status === 'resolved' && "bg-success/20 text-success",
                      query.status === 'pending' && "bg-warning/20 text-warning"
                    )}>
                      {query.status === 'resolved' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {query.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {query.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">"{query.query}"</p>
                <div className="bg-success/10 border border-success/20 rounded p-2">
                  <p className="text-xs text-success">{query.response}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
