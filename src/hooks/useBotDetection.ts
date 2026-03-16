/**
 * Honeypot Bot Detection
 * 
 * Two layers:
 * 1. Invisible honeypot fields — bots fill them, humans don't
 * 2. Timing detection — submissions faster than 2 seconds are flagged as bots
 */

import { useRef, useState, useCallback } from 'react';

export interface BotDetection {
  /** The honeypot field value — should always be empty for humans */
  honeypotValue: string;
  setHoneypotValue: (v: string) => void;
  /** Call when form mounts to start the timer */
  startTimer: () => void;
  /** Returns true if the submission looks like a bot */
  isBot: () => boolean;
  /** CSS class to hide the honeypot field from humans but visible to bots */
  honeypotClassName: string;
}

const MIN_HUMAN_MS = 2000; // 2 seconds minimum for a human to fill a form

export function useBotDetection(): BotDetection {
  const [honeypotValue, setHoneypotValue] = useState('');
  const mountTime = useRef<number>(Date.now());

  const startTimer = useCallback(() => {
    mountTime.current = Date.now();
  }, []);

  const isBot = useCallback(() => {
    // Check 1: Honeypot field was filled (invisible to humans)
    if (honeypotValue.length > 0) return true;

    // Check 2: Form submitted too fast (< 2 seconds)
    const elapsed = Date.now() - mountTime.current;
    if (elapsed < MIN_HUMAN_MS) return true;

    return false;
  }, [honeypotValue]);

  return {
    honeypotValue,
    setHoneypotValue,
    startTimer,
    isBot,
    // Visually hidden but accessible to bots that parse CSS poorly
    honeypotClassName: 'absolute -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden opacity-0 pointer-events-none',
  };
}
