import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn, staggerContainer } from '../lib/animations';

interface AnimatedSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function AnimatedSection({ title, subtitle, children, className = '' }: AnimatedSectionProps) {
  return (
    <section className={className}>
      {(title || subtitle) && (
        <motion.div
          className="text-center mb-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {title && (
            <>
              <motion.h2 className="text-4xl font-bold text-primary mb-4" variants={fadeInUp}>
                {title}
              </motion.h2>
              <motion.div className="w-24 h-1 bg-accent mx-auto mb-6" variants={scaleIn}></motion.div>
            </>
          )}
          {subtitle && (
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      )}
      {children}
    </section>
  );
}
