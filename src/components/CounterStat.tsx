import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { scaleIn } from '../lib/animations';

interface CounterStatProps {
  icon: ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

export default function CounterStat({ icon, value, suffix = '', label, delay = 0 }: CounterStatProps) {
  const { count, ref } = useCounterAnimation({ end: value, duration: 2000 });

  return (
    <motion.div
      ref={ref}
      className="text-center p-6 bg-sand rounded-lg hover:shadow-lg transition-shadow"
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <motion.div
        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {icon}
      </motion.div>
      <div className="text-4xl font-bold text-primary mb-2">
        {Math.floor(count)}{suffix}
      </div>
      <div className="text-muted">{label}</div>
    </motion.div>
  );
}
