import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Note } from '../types';
import { X, BookOpen, Clock, Tag } from 'lucide-react';

interface NoteDetailProps {
    note: Note | null;
    onClose: () => void;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose }) => {
    // Lock body scroll when active
    useEffect(() => {
        if (note) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [note]);

    if (!note) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#050608]/95 backdrop-blur-xl flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[110] p-3 bg-white/5 rounded-full hover:bg-white/10 text-secondaryText hover:text-white transition-all transform hover:rotate-90 hover:scale-110"
            >
                <X size={20} />
            </button>

            {/* Content Card */}
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-surface/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden max-h-[85vh] overflow-y-auto"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                            <BookOpen size={24} className="text-accent" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3 flex-wrap">
                                <span className="flex items-center gap-1.5 text-xs font-mono text-secondaryText/60">
                                    <Clock size={12} />
                                    {note.date}
                                </span>
                                <span className="text-secondaryText/30">•</span>
                                <span className="text-xs font-mono text-secondaryText/60">
                                    {note.readTime}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-primaryText tracking-tight leading-tight">
                                {note.title}
                            </h2>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {note.tags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 text-[10px] font-mono px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-secondaryText/70 uppercase tracking-wider"
                            >
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Summary / Content */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono text-secondaryText/50 uppercase tracking-widest">Summary</h3>
                        <p className="text-lg text-primaryText/90 leading-relaxed">
                            {note.summary}
                        </p>
                    </div>

                    {/* Placeholder for full content */}
                    <div className="p-6 bg-white/3 border border-white/5 rounded-2xl">
                        <p className="text-sm text-secondaryText/50 italic text-center">
                            Full article content would appear here...
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
