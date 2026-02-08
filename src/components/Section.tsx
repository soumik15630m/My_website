import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Section: React.FC<SectionProps> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{
        duration: 0.7,
        delay: delay,
        ease: [0.16, 1, 0.3, 1] // Smooth deceleration
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};