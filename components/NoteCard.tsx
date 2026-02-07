import React from 'react';
import { Note } from '../types';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  index: number;
  onClick?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, index, onClick }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.05 } }
      }}
      whileHover={{
        scale: 1.005,
        y: -3,
        backgroundColor: "rgba(138, 180, 248, 0.02)",
        borderColor: "rgba(138, 180, 248, 0.08)"
      }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group block py-6 border border-transparent border-b-white/5 px-5 -mx-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="flex gap-5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all">
          <BookOpen size={16} className="text-accent/50 group-hover:text-accent transition-colors" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-secondaryText/40 uppercase tracking-widest mb-2">
            <span>{note.date}</span>
            <span className="w-1 h-1 rounded-full bg-secondaryText/20" />
            <span>{note.readTime}</span>
          </div>

          {/* Title & Summary */}
          <h3 className="text-lg font-semibold text-primaryText group-hover:text-white transition-colors mb-1.5">
            {note.title}
          </h3>
          <p className="text-secondaryText/70 text-sm leading-relaxed line-clamp-2">
            {note.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              {note.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-[9px] font-mono border border-white/5 px-2 py-0.5 rounded-full text-secondaryText/50 bg-white/2 uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-accent text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span>Read</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};