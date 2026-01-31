import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../lib/animations';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}
