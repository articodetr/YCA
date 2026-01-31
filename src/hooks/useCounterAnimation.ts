import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseCounterAnimationOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export const useCounterAnimation = (options: UseCounterAnimationOptions) => {
  const { end, duration = 2000, start = 0, decimals = 0 } = options;
  const [count, setCount] = useState(start);
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;

      setCount(parseFloat(currentCount.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [inView, start, end, duration, decimals]);

  return { count, ref };
};

export default useCounterAnimation;
