import { useState, useEffect, useRef } from 'react';

export function useAnimatedNumber(target: number, duration = 600) {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>();
  const startRef = useRef(current);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startRef.current = current;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - (startTimeRef.current || now);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(startRef.current + (target - startRef.current) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}
