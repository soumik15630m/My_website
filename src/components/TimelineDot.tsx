import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

interface TimelineDotProps {
    children: React.ReactElement; // Must be a single element to clone
    index: number;
}

export const TimelineDot: React.FC<TimelineDotProps> = ({ children, index }) => {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "center center", "end start"]
    });

    // Sync Fix: useSpring configuration matches TimelineTrail exactly.
    const smoothProgress = useSpring(scrollYProgress, {
        mass: 2,
        stiffness: 50,
        damping: 50,
        restDelta: 0.001
    });

    // Transform scroll progress to glow values

    // Opacity: Minimal at start, Blooms at center, Stays active
    const glowOpacity = useTransform(smoothProgress, [0, 0.48, 0.5, 1], [0.1, 0.1, 1, 1]);

    // Scale: Small -> Pop -> Normal active
    const glowScale = useTransform(smoothProgress, [0, 0.48, 0.5, 1], [0.8, 0.8, 1.4, 1]);

    // Dot shadow glow - No shadow before, intense at center, stays subtle active
    const dotShadow = useTransform(
        smoothProgress,
        [0, 0.48, 0.5, 1],
        [
            "none",
            "none",
            "0px 0px 20px rgba(34, 197, 94, 1), 0px 0px 40px rgba(34, 197, 94, 0.6)",
            "0px 0px 10px rgba(34, 197, 94, 0.4)"
        ]
    );

    // Number transforms
    const numberOpacity = useTransform(smoothProgress, [0, 0.48, 0.5, 1], [0.05, 0.05, 0.3, 0.2]);
    const numberScale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1.1, 1]);
    const numberY = useTransform(smoothProgress, [0, 0.5, 1], [20, 0, 0]);

    // Clone child to pass activeValue (the progress)
    // We pass 'smoothProgress' so the child can derive its own animations (like arrow opacity)
    const childWithProp = React.cloneElement(children, {
        activeValue: smoothProgress,
        // @ts-ignore - injecting prop that might not be in generic ReactElement type
    });

    return (
        <div ref={ref} className="relative">
            {/* Serial number - repositioned to -left-32 (8rem) for clearance */}
            <motion.span
                style={{
                    opacity: numberOpacity,
                    scale: numberScale,
                    y: numberY,
                    filter: "blur(0.5px)"
                }}
                className="absolute -left-32 top-1/2 -translate-y-1/2 text-7xl font-bold text-white select-none hidden md:block pointer-events-none font-mono tracking-tighter"
            >
                {String(index + 1).padStart(2, '0')}
            </motion.span>

            {/* Timeline dot - aligned center with line at -left-4 (approx) */}
            <motion.div
                style={{
                    opacity: glowOpacity,
                    scale: glowScale,
                    boxShadow: dotShadow
                }}
                className="absolute -left-[1.4rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 hidden md:block z-10"
            />

            {childWithProp}
        </div>
    );
};
