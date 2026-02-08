import React, { Suspense } from 'react';
import { Project } from '../types';
import { motion, MotionValue, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, Layers, Code2, GitBranch } from 'lucide-react';

// Lazy load MermaidDiagram for better code splitting
const MermaidDiagram = React.lazy(() => import('./MermaidDiagram').then(mod => ({ default: mod.MermaidDiagram })));

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  activeValue?: MotionValue<number>;
  index?: number;
  total?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen, activeValue, index = 0, total = 0 }) => {
  const slideClass = "min-w-full h-full p-8 md:p-10 flex flex-col snap-center relative";

  // Use fallback motion value if activeValue not provided
  const fallbackProgress = useMotionValue(0);
  const progress = activeValue || fallbackProgress;

  // Dynamic animations based on scroll progress (activeValue)
  // Arrow appears when centered (0.5) and stays active
  const arrowOpacity = useTransform(progress, [0.45, 0.5, 1], [0, 1, 1]);
  const arrowX = useTransform(progress, [0.45, 0.5, 1], [-10, 0, 0]);
  const arrowScale = useTransform(progress, [0.45, 0.5, 1], [0.8, 1, 1]);

  // Arrow glow effect
  const arrowShadow = useTransform(
    progress,
    [0.45, 0.5, 1],
    [
      "0 0 0px rgba(34,197,94,0)",
      "0 0 20px rgba(34,197,94,0.6)",
      "0 0 10px rgba(34,197,94,0.3)"
    ]
  );

  // Calculate total slides (3 base + 1 if architecture exists)
  const hasArchitecture = !!project.architecture;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{
        scale: 1.01,
        y: -4,
        boxShadow: "0 20px 40px -10px rgba(138, 180, 248, 0.15)"
      }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={() => onOpen(project)} // Whole card clickable
      className="group relative w-full h-[480px] border border-border bg-surface/40 rounded-[2rem] overflow-hidden hover:border-white/10 transition-colors cursor-pointer"
    >
      {/* Dynamic Arrow Indicator - Appears when focused */}
      <motion.div
        style={{
          opacity: arrowOpacity,
          x: arrowX,
          scale: arrowScale,
          boxShadow: arrowShadow,
        }}
        className="absolute bottom-8 right-8 z-50 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center border border-accent/50 text-accent backdrop-blur-sm shadow-lg pointer-events-none"
      >
        <ArrowRight size={20} />
      </motion.div>

      {/* Ongoing Counter in Top Card */}
      <div className="absolute top-8 right-8 z-20 pointer-events-none">
        <span className="font-mono text-xs text-secondaryText/40 tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none">

        {/* === SLIDE 1: SNAPSHOT === */}
        <div className={slideClass}>
          <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-accent border border-accent/20 px-2 py-1 rounded-full uppercase tracking-widest">
                {project.year}
              </span>
              <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${project.status === 'active' ? 'text-green-400' : 'text-secondaryText'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-green-400' : 'bg-secondaryText'}`} />
                {project.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center h-full space-y-6 pt-12">
            <h3
              className="text-4xl md:text-5xl font-bold text-primaryText tracking-tighter group-hover:translate-x-1 transition-transform duration-300 hover:text-accent"
            >
              {project.title}
            </h3>
            <p className="text-lg text-secondaryText font-light leading-relaxed line-clamp-3">
              {project.description}
            </p>

            {/* Project Image Preview */}
            {project.image && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface border border-white/5">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-8">
            <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest">
              01 // Overview
            </p>
          </div>
        </div>

        {/* === SLIDE 2: TECH DETAILS === */}
        <div className={`${slideClass} bg-surfaceHighlight/20`}>
          <div className="h-full flex flex-col justify-center gap-8">
            <div>
              <div className="flex items-center gap-3 text-secondaryText mb-4">
                <Code2 size={20} />
                <h4 className="text-xs font-mono uppercase tracking-widest opacity-70">Tech Stack</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="text-xs font-medium text-primaryText bg-white/5 px-2.5 py-1.5 rounded border border-white/5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 text-secondaryText mb-4">
                <Layers size={20} />
                <h4 className="text-xs font-mono uppercase tracking-widest opacity-70">Core Problem</h4>
              </div>
              <p className="text-sm text-primaryText/80 leading-relaxed font-light line-clamp-4">
                {project.problemStatement}
              </p>
            </div>
          </div>

          <div className="absolute bottom-8 left-8">
            <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest">
              02 // Details
            </p>
          </div>
        </div>

        {/* === SLIDE 3: ARCHITECTURE DIAGRAM (conditional) === */}
        {hasArchitecture && (
          <div className={`${slideClass} bg-black/20`}>
            {/* Header */}
            <div className="absolute top-8 left-8 flex items-center gap-3 text-secondaryText">
              <GitBranch size={18} />
              <h4 className="text-xs font-mono uppercase tracking-widest opacity-70">Architecture</h4>
            </div>

            {/* Diagram Container - centered with proper spacing */}
            <div className="flex-1 w-full flex items-center justify-center p-4 pt-12 pb-12 overflow-hidden">
              <div className="w-full h-full rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden relative group/diagram">

                {/* Zoom hint */}
                <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 border border-white/10 text-white/20 opacity-0 group-hover/diagram:opacity-100 transition-opacity pointer-events-none z-10">
                  <GitBranch size={12} />
                </div>

                <div className="w-full h-full p-4 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div className="min-w-full min-h-full flex items-center justify-center">
                    <Suspense fallback={
                      <div className="flex items-center justify-center p-4">
                        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      </div>
                    }>
                      <MermaidDiagram
                        chart={project.architecture!}
                        className="w-full"
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer label */}
            <div className="absolute bottom-8 left-8">
              <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest">
                03 // Architecture
              </p>
            </div>
          </div>
        )}

        {/* === SLIDE 4 (or 3): ACTION === */}
        <div className={`${slideClass} bg-accent/5 items-center justify-center text-center`}>
          <div className="space-y-6 max-w-xs">
            <h3 className="text-2xl font-bold text-primaryText">Dive Deeper</h3>
            <p className="text-sm text-secondaryText font-light">
              Explore the full architectural blueprint, decisions, and outcomes.
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black rounded-full text-sm font-medium hover:bg-white transition-colors duration-300 pointer-events-none"
            >
              Explore Project
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="absolute bottom-8 left-8">
            <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest">
              {hasArchitecture ? '04' : '03'} // Action
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};