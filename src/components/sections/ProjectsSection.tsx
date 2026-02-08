import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../Section';
import { ScrollTrigger } from '../ScrollTrigger';
import { TimelineTrail } from '../TimelineTrail';
import { TimelineDot } from '../TimelineDot';
import { ProjectCard } from '../ProjectCard';
import { Project } from '../../types';

// Lazy load heavy Mermaid diagram component
const MermaidDiagram = React.lazy(() => import('../MermaidDiagram').then(module => ({ default: module.MermaidDiagram })));

interface ProjectsSectionProps {
    projects: Project[];
    handleViewChange: (view: any) => void;
    setSelectedProject: (project: Project) => void;
    containerVariants: any;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
    projects,
    handleViewChange,
    setSelectedProject,
    containerVariants
}) => {
    return (
        <div className="max-w-5xl mx-auto relative">
            {/* === DECORATIVE ELEMENTS === */}
            {/* Floating Ambient Orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Top-right accent orb */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-[100px]"
                />
                {/* Bottom-left accent orb */}
                <motion.div
                    animate={{
                        y: [0, 15, 0],
                        x: [0, 10, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]"
                />
                {/* Small floating accent */}
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/3 right-0 w-2 h-2 rounded-full bg-accent/40"
                />
            </div>

            {/* Grid Pattern Overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(138, 180, 248, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 180, 248, 0.5) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Section Header with decorative line */}
            <Section className="mb-20 text-center md:text-left relative">
                {/* Decorative corner accent */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-accent/20 rounded-tl-lg hidden md:block" />

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60px' }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                    className="h-[2px] bg-gradient-to-r from-accent to-transparent mb-8 hidden md:block"
                />

                <h2 className="text-4xl md:text-5xl font-semibold text-primaryText mb-6 tracking-tight">
                    Selected Work
                </h2>
                <p className="text-xl text-secondaryText font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
                    Architecting high-concurrency systems, optimizing distributed databases, and building developer tools.
                </p>

                {/* Stats/metrics accent */}
                <div className="flex gap-8 mt-8 text-center md:text-left">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-3xl font-bold text-accent"
                        >
                            {projects.length}
                        </motion.span>
                        <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest mt-1">Projects</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-3xl font-bold text-primaryText"
                        >
                            {projects.filter(p => p.status === 'active').length}
                        </motion.span>
                        <p className="text-xs font-mono text-secondaryText/60 uppercase tracking-widest mt-1">Active</p>
                    </div>
                </div>
            </Section>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-16 relative z-10 md:ml-32"
            >
                {/* Global Timeline Trail - fills continuously as you scroll */}
                <TimelineTrail />

                {projects.map((project, index) => (
                    <TimelineDot key={project.id} index={index}>
                        <ProjectCard
                            project={project}
                            onOpen={setSelectedProject}
                            index={index}
                            total={projects.length}
                        />
                    </TimelineDot>
                ))}
            </motion.div>

            <ScrollTrigger nextSection="Certificates" onClick={() => handleViewChange('achievements')} />
        </div>
    );
};
