import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const TimelineTrail: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll progress of this container relative to viewport
    // "start end" = top of container hits bottom of view (0%)
    // "end center" = bottom of container hits center of view (100%) - allow Trail to fill up to current read point
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        mass: 3,
        stiffness: 25,
        damping: 80,
        restDelta: 0.001
    });

    return (
        <div ref={containerRef} className="absolute -left-4 top-0 bottom-0 w-[3px] hidden md:block pointer-events-none">
            {/* Background Track */}
            <div className="absolute inset-0 bg-white/5 rounded-full" />

            {/* Active Filling Trail */}
            <motion.div
                style={{ scaleY, originY: 0 }}
                className="absolute top-0 w-full h-full bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            />
        </div>
    );
};
