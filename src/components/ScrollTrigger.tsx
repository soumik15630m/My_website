import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollTriggerProps {
    nextSection: string;
    onClick?: () => void;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({ nextSection, onClick }) => {
    const y = useMotionValue(0);
    const controls = useAnimation();

    // Visual feedback transforms
    const dragProgress = useTransform(y, [0, 100], [0, 1]);
    const titleOpacity = useTransform(y, [0, 50], [1, 0.3]);
    const buttonScale = useTransform(y, [0, 100], [1, 0.85]);
    const glowIntensity = useTransform(y, [0, 60, 100], [0, 0.5, 1]);

    const handleDragEnd = () => {
        const currentY = y.get();

        // Trigger navigation if dragged past threshold
        if (currentY > 70) {
            if (onClick) {
                onClick();
            }
        }

        // Always reset position
        controls.start({
            y: 0,
            transition: { type: "spring", stiffness: 400, damping: 25 }
        });
        y.set(0);
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className="min-h-[35vh] w-full flex flex-col items-center justify-center relative mt-16 pb-8">
            {/* Gradient Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-5 z-20"
            >
                {/* Label */}
                <div className="flex items-center gap-3">
                    <span className="h-px w-6 bg-secondaryText/20" />
                    <span className="text-[10px] font-mono text-secondaryText/40 uppercase tracking-[0.25em]">
                        Scroll to Continue
                    </span>
                    <span className="h-px w-6 bg-secondaryText/20" />
                </div>

                {/* Section Name */}
                <motion.h3
                    style={{ opacity: titleOpacity }}
                    className="text-xl font-semibold text-primaryText tracking-tight"
                >
                    {nextSection}
                </motion.h3>

                {/* Drag Track */}
                <div className="relative h-28 flex flex-col items-center">
                    {/* Background Track */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-white/5 rounded-full" />

                    {/* Progress Fill */}
                    <motion.div
                        style={{ scaleY: dragProgress, opacity: glowIntensity }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-accent origin-top rounded-full"
                    />

                    {/* Draggable Button */}
                    <motion.button
                        type="button"
                        style={{ y, scale: buttonScale }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 100 }}
                        dragElastic={0.05}
                        onDragEnd={handleDragEnd}
                        onClick={handleClick}
                        animate={controls}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(138, 180, 248, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full border border-white/15 bg-surface/95 backdrop-blur flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-accent/40 transition-colors z-10 touch-none select-none"
                    >
                        <ChevronDown size={20} className="text-accent pointer-events-none" />
                    </motion.button>

                    {/* Target Zone */}
                    <motion.div
                        style={{ opacity: glowIntensity }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-dashed border-accent/40 flex items-center justify-center"
                    >
                        <div className="w-2 h-2 rounded-full bg-accent/60" />
                    </motion.div>
                </div>

                {/* Hint */}
                <span className="text-[9px] font-mono text-secondaryText/25 uppercase tracking-wider">
                    drag or tap
                </span>
            </motion.div>
        </div>
    );
};
