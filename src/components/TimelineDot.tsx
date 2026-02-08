import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface TimelineDotProps {
    children: React.ReactElement;
    index: number;
    total: number;
    globalProgress: MotionValue<number>;
}

export const TimelineDot: React.FC<TimelineDotProps> = ({ children, index, total, globalProgress }) => {
    // Determine the exact progress point where this dot sits on the line.
    // 0 = Top (Index 0), 1 = Bottom (Index total-1).
    const threshold = total > 1 ? index / (total - 1) : 0;

    // Define a small "activation window" around the threshold.
    // When the line approaches (threshold - buffer), we start glowing.
    // buffer = 0.05 means "5% of section height before the dot".
    const buffer = 0.05;
    const start = Math.max(0, threshold - buffer);
    const end = Math.min(1, threshold);

    // Transform global progress to local glow values
    // Opacity: Fades in as line approaches
    const glowOpacity = useTransform(globalProgress, [start, end], [0.1, 1]);

    // Scale: Pops up as line hits it
    const glowScale = useTransform(globalProgress, [start, end, end + 0.1], [0.8, 1.4, 1]);

    // Shadow: Intense glow at hit moment
    const dotShadow = useTransform(
        globalProgress,
        [start, end, end + 0.1],
        [
            "none",
            "0px 0px 20px rgba(34, 197, 94, 1), 0px 0px 40px rgba(34, 197, 94, 0.6)",
            "0px 0px 10px rgba(34, 197, 94, 0.4)"
        ]
    );

    // Number transforms
    const numberOpacity = useTransform(globalProgress, [start, end], [0.05, 0.3]);
    const numberScale = useTransform(globalProgress, [start, end, end + 0.1], [0.9, 1.1, 1]);
    const numberY = useTransform(globalProgress, [start, end, end + 0.1], [20, 0, 0]);

    // Pass a "local" 0-1 progress to child if it needs it (Optional)
    // We map 0..1 global to "Active" boolean or similar if needed, 
    // but for now we pass the raw value or a derived signal.
    // Let's pass the 'glowOpacity' as a proxy for "how active I am"
    const childWithProp = React.cloneElement(children, {
        activeValue: glowOpacity,
        // @ts-ignore
    });

    return (
        <div className="relative">
            {/* Serial number */}
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

            {/* Timeline dot */}
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
