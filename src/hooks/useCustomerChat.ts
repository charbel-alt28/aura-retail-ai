import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHypermarketStore } from '@/lib/store';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  sentimentScore?: number;
  category?: string;
  suggestedProducts?: { name: string; reason: string }[];
  resolved?: boolean;
  escalationNeeded?: boolean;
  escalationReason?: string | null;
}

export interface CannedTemplate {
  id: string;
  label: string;
  message: string;
  category: string;
}

export const CANNED_TEMPLATES: CannedTemplate[] = [
  { id: '1', label: 'Return Policy', message: 'What is your return policy?', category: 'return_policy' },
  { id: '2', label: 'Store Hours', message: 'What are your store hours?', category: 'hours' },
  { id: '3', label: 'Delivery Info', message: 'Do you offer delivery? What are the options?', category: 'delivery' },
  { id: '4', label: 'Payment Methods', message: 'What payment methods do you accept?', category: 'payment' },
  { id: '5', label: 'Loyalty Program', message: 'Tell me about your loyalty rewards program', category: 'loyalty' },
  { id: '6', label: 'Check Product', message: 'Is [product name] in stock? What\'s the price?', category: 'availability' },
  { id: '7', label: 'File Complaint', message: 'I have a complaint about my recent experience', category: 'complaint' },
  { id: '8', label: 'Bulk Order', message: 'I want to place a bulk order. What discounts are available?', category: 'general' },
  { id: '9', label: 'Allergen Info', message: 'Can you help me find products that are gluten-free?', category: 'product_inquiry' },
  { id: '10', label: 'Price Match', message: 'Do you offer price matching with competitors?', category: 'general' },
];

export function useCustomerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState('Guest');
  const [sentimentStats, setSentimentStats] = useState({ positive: 0, neutral: 0, negative: 0, urgent: 0 });
  const { products } = useHypermarketStore();

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('customer-service-ai', {
        body: {
          message: text.trim(),
          customerName,
          conversationHistory,
          products: products.map(p => ({
            name: p.name,
            stock: p.stock,
            currentPrice: p.currentPrice,
            basePrice: p.basePrice,
            category: p.category,
            demandLevel: p.demandLevel,
          })),
        },
      });

      if (error) throw new Error(error.message || 'AI service error');
      if (data?.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'I apologize, I could not process your request.',
        timestamp: new Date(),
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        category: data.category,
        suggestedProducts: data.suggestedProducts,
        resolved: data.resolved,
        escalationNeeded: data.escalationNeeded,
        escalationReason: data.escalationReason,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Update sentiment stats
      if (data.sentiment) {
        setSentimentStats(prev => ({
          ...prev,
          [data.sentiment]: prev[data.sentiment as keyof typeof prev] + 1,
        }));
      }

      if (data.escalationNeeded) {
        toast.warning(`⚠️ Escalation needed: ${data.escalationReason || 'Customer needs human assistance'}`);
      }
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize for the inconvenience. Our team will follow up within 24 hours. Is there anything else I can help with?',
        timestamp: new Date(),
        sentiment: 'neutral',
        sentimentScore: 50,
        category: 'general',
        resolved: false,
      };
      setMessages(prev => [...prev, fallbackMsg]);
      toast.error(err.message || 'Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages, customerName, products]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSentimentStats({ positive: 0, neutral: 0, negative: 0, urgent: 0 });
  }, []);

  return {
    messages,
    isTyping,
    customerName,
    setCustomerName,
    sendMessage,
    clearChat,
    sentimentStats,
  };
}
