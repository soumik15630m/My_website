import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { X, ArrowRight, Github, Layers, Cpu, CheckCircle2 } from 'lucide-react';

interface ProjectFlowProps {
    project: Project | null;
    onClose: () => void;
}

export const ProjectFlow: React.FC<ProjectFlowProps> = ({ project, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when active
    useEffect(() => {
        if (project) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [project]);

    if (!project) return null;

    // Window/Slide common styles - Cleaner, no heavy borders, more subtle
    const slideClass = "w-[85vw] md:w-[60vw] h-[75vh] flex-shrink-0 snap-center bg-surface/50 backdrop-blur-sm border border-white/5 rounded-[2rem] p-10 md:p-16 relative flex flex-col justify-between overflow-hidden shadow-2xl";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#050608]/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
        >
            {/* Close Button - Fixed & Stylized */}
            <button
                onClick={onClose}
                className="fixed top-8 right-8 z-[110] p-3 bg-white/5 rounded-full hover:bg-white/10 text-secondaryText hover:text-white transition-all transform hover:rotate-90 hover:scale-110"
            >
                <X size={24} />
            </button>

            {/* Horizontal Scroll Container - This scrolls, backdrop stays fixed */}
            <div
                ref={containerRef}
                className="absolute inset-0 flex items-center overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none"
            >
                <div className="flex items-center h-full px-[7.5vw] md:px-[20vw] gap-6 md:gap-12">
                    {/* === WINDOW 1: OVERVIEW === */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                        className={slideClass}
                    >
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-accent border border-accent/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    {project.year}
                                </span>
                                <span className={`text-xs font-mono uppercase tracking-widest ${project.status === 'active' ? 'text-green-400' : 'text-secondaryText'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>

                            <h2 className="text-5xl md:text-8xl font-bold text-primaryText tracking-tighter leading-none">
                                {project.title}
                            </h2>

                            <p className="text-xl md:text-3xl text-secondaryText font-light leading-relaxed max-w-4xl">
                                {project.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-secondaryText/40 uppercase tracking-widest">
                            <span>Scroll</span>
                            <ArrowRight size={14} />
                        </div>
                    </motion.div>

                    {/* === WINDOW 2: THE PROBLEM === */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                        className={`${slideClass} bg-surfaceHighlight/10 border-accent/10`}
                    >
                        <div className="flex items-center gap-4 text-secondaryText mb-8">
                            <div className="p-3 bg-white/5 rounded-xl"><Cpu size={24} /></div>
                            <h3 className="text-sm font-mono uppercase tracking-widest">The Problem Space</h3>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-2xl md:text-4xl text-primaryText font-light leading-tight text-center max-w-4xl">
                                "{project.problemStatement}"
                            </p>
                        </div>
                    </motion.div>


                    {/* === WINDOW 3: TECHNICAL ARCHITECTURE === */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                        className={slideClass}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 text-accent mb-12">
                                <div className="p-3 bg-accent/10 rounded-xl"><Layers size={24} /></div>
                                <h3 className="text-sm font-mono uppercase tracking-widest">Architecture Decisions</h3>
                            </div>

                            <ul className="space-y-6 overflow-y-auto pr-4 scrollbar-thin flex-1">
                                {project.technicalDecisions.map((decision, i) => (
                                    <li key={i} className="flex items-start gap-6">
                                        <CheckCircle2 size={24} className="mt-1 text-accent shrink-0" />
                                        <span className="text-xl text-primaryText/90 font-light leading-relaxed">{decision}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-10 mt-10 border-t border-white/5">
                                <div className="flex flex-wrap gap-3">
                                    {project.techStack.map((tech) => (
                                        <span key={tech} className="text-sm font-medium text-secondaryText bg-white/5 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* === WINDOW 4: LINKS & ACTION === */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                        className={`${slideClass} justify-center items-center bg-accent/5 border-accent/20`}
                    >
                        {project.githubUrl ? (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center gap-10"
                            >
                                <div className="w-32 h-32 rounded-full bg-surface border border-accent/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent group-hover:text-black transition-all duration-300 shadow-2xl shadow-accent/10">
                                    <Github size={48} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-4xl font-medium text-primaryText group-hover:text-accent transition-colors tracking-tight">View Source</h3>
                                    <p className="text-secondaryText font-mono text-base opacity-60">github.com/0x1A</p>
                                </div>
                            </a>
                        ) : (
                            <div className="text-center opacity-50 space-y-4">
                                <h3 className="text-3xl font-medium text-primaryText">Source Private</h3>
                                <p className="text-secondaryText font-mono text-base">Contact for access</p>
                            </div>
                        )}
                    </motion.div>
                    <div className="w-[20vw] h-1 shrink-0" /> {/* End spacer for scroll padding */}
                </div>
            </div>
        </motion.div>
    );
};
