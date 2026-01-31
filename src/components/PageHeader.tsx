import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInDown, staggerContainer, staggerItem } from '../lib/animations';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  image?: string;
}

export default function PageHeader({ title, description, breadcrumbs, image }: PageHeaderProps) {
  const backgroundImage = image || '/image.png';

  return (
    <section className="relative h-80 flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/85 to-primary/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      <motion.div
        className="container mx-auto px-4 relative z-10 text-center pt-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold text-white mb-4"
          variants={fadeInDown}
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            className="text-xl text-gray-200 max-w-3xl mx-auto mb-6 leading-relaxed"
            variants={fadeInUp}
          >
            {description}
          </motion.p>
        )}

        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav
            className="flex items-center justify-center gap-2 text-white/90 text-sm"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <Link
                to="/"
                className="hover:text-accent transition-colors"
              >
                Home
              </Link>
            </motion.div>
            {breadcrumbs.map((crumb, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                variants={staggerItem}
              >
                <ChevronRight size={16} className="text-accent" />
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-accent transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-accent font-semibold">{crumb.label}</span>
                )}
              </motion.div>
            ))}
          </motion.nav>
        )}
      </motion.div>
    </section>
  );
}
