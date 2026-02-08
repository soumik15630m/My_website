import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface TimelineTrailProps {
    progress: MotionValue<number>;
}

export const TimelineTrail: React.FC<TimelineTrailProps> = ({ progress }) => {
    return (
        <div className="absolute -left-4 top-0 bottom-0 w-[3px] hidden md:block pointer-events-none">
            {/* Background Track */}
            <div className="absolute inset-0 bg-white/5 rounded-full" />

            {/* Active Filling Trail - Driven by parent physics */}
            <motion.div
                style={{ scaleY: progress, originY: 0 }}
                className="absolute top-0 w-full h-full bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            />
        </div>
    );
};
