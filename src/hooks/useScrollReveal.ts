import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAnimation, AnimationControls } from 'framer-motion';

interface UseScrollRevealOptions {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0
  } = options;

  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold,
    triggerOnce
  });

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        controls.start('visible');
      }, delay);
      return () => clearTimeout(timer);
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [inView, controls, delay, triggerOnce]);

  return { ref, controls, inView };
};

export default useScrollReveal;
