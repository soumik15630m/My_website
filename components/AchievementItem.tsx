import React from 'react';
import { Achievement } from '../types';
import { motion } from 'framer-motion';
import { ExternalLink, Award, ChevronRight } from 'lucide-react';

interface AchievementItemProps {
  achievement: Achievement;
  index: number;
  onClick?: () => void;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, index, onClick }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { delay: index * 0.05 } }
      }}
      whileHover={{
        x: 6,
        backgroundColor: "rgba(138, 180, 248, 0.03)",
        borderColor: "rgba(138, 180, 248, 0.1)"
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-6 py-5 border-b border-white/5 group px-4 -mx-4 rounded-xl cursor-pointer transition-colors"
    >
      {/* Year Badge */}
      <div className="font-mono text-[10px] text-secondaryText/50 uppercase tracking-widest w-14 shrink-0 pt-1">
        {achievement.year}
      </div>

      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
        <Award size={14} className="text-accent/60 group-hover:text-accent transition-colors" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-primaryText font-medium text-base flex items-center gap-3 group-hover:text-white transition-colors">
          <span className="truncate">{achievement.title}</span>
        </h4>
        <p className="text-secondaryText/70 text-sm mt-1 line-clamp-2 leading-relaxed">
          {achievement.context}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-1">
        <ChevronRight size={16} className="text-accent" />
      </div>
    </motion.div>
  );
};