import React, { useRef, useState, useEffect } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface TimelineDotProps {
    children: React.ReactElement;
    index: number;
    total: number;
    globalProgress: MotionValue<number>;
}

export const TimelineDot: React.FC<TimelineDotProps> = ({ children, index, total, globalProgress }) => {
    const dotRef = useRef<HTMLDivElement>(null);
    const [threshold, setThreshold] = useState(1); // Default to 1 (bottom) so it doesn't glow initially

    useEffect(() => {
        const calculateThreshold = () => {
            if (dotRef.current && dotRef.current.offsetParent) {
                const element = dotRef.current;
                const parent = element.offsetParent as HTMLElement;
                const relativeTop = element.offsetTop;
                const parentHeight = parent.scrollHeight;

                // Calculate exact percentage position of the dot (centered vertically in the card wrapper)
                // The dot is at top-1/2 of this wrapper. 'offsetTop' is the top of this wrapper.
                // We want the center, so relativeTop + element.offsetHeight / 2
                // Force a minimum height if 0 to avoid NaN
                const height = element.offsetHeight || 0;
                const dotCenter = relativeTop + (height / 2);

                if (parentHeight > 0) {
                    setThreshold(dotCenter / parentHeight);
                }
            }
        };

        // Calculate initially and on resize
        calculateThreshold();
        // Small delay to ensure layout is stable
        const timer = setTimeout(calculateThreshold, 100);

        window.addEventListener('resize', calculateThreshold);
        return () => {
            window.removeEventListener('resize', calculateThreshold);
            clearTimeout(timer);
        };
    }, []);

    // Define a tighter activation window.
    // buffer = 0.005 means "0.5% tolerance".
    // 0.05 was too generous (5%), causing pre-glow.
    const buffer = 0.005;
    const start = Math.max(0, threshold - buffer);
    const end = Math.min(1, threshold);

    // Transform global progress to local glow values
    // Opacity: Fades in sharply as line hits
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

    // Pass a "local" active value to child
    const childWithProp = React.cloneElement(children, {
        activeValue: glowOpacity,
        // @ts-ignore
    });

    return (
        <div ref={dotRef} className="relative">
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
