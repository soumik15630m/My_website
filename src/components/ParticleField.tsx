import React, { useRef, useEffect, useCallback } from 'react';

export type ParticleMode = 'default' | 'performance';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    baseAlpha: number;
    targetX?: number;
    targetY?: number;
}

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 250;
const IDLE_TIMEOUT = 120000; // 2 minutes

interface ParticleFieldProps {
    text?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ text = "STK" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, isClicking: false });
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const scrollVelocityRef = useRef(0);
    const lastScrollY = useRef(0);

    // Idle State
    const [isIdle, setIsIdle] = React.useState(false);
    const idleTimerRef = useRef<NodeJS.Timeout>();
    const targetPointsRef = useRef<{ x: number, y: number }[]>([]);

    // Reset Idle Timer
    const resetIdleTimer = useCallback(() => {
        setIsIdle(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setIsIdle(true);
        }, IDLE_TIMEOUT);
    }, []);

    // Generate Target Points from Text
    const generateTargetPoints = useCallback((width: number, height: number, textToRender: string) => {
        if (!textToRender) return;

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        ctx.font = 'bold 20vw "Orbitron", sans-serif'; // Large, stylish font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(textToRender, width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height).data;
        const points: { x: number, y: number }[] = [];

        // Sample pixels (step > 1 for performance)
        for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
                if (imageData[(y * width + x) * 4 + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }

        targetPointsRef.current = points;
    }, []);

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        particlesRef.current = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const size = Math.random() * 1.8 + 0.4;
            const baseAlpha = Math.random() * 0.3 + 0.1;
            particlesRef.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                size,
                alpha: baseAlpha,
                baseAlpha,
            });
        }
        generateTargetPoints(width, height, text);
    }, [text, generateTargetPoints]);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const mouse = mouseRef.current;

        ctx.clearRect(0, 0, width, height);

        // Draw Watermark (Background)
        if (text) {
            ctx.save();
            ctx.font = 'bold 20vw "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; // Very subtle
            ctx.fillText(text, width / 2, height / 2);
            ctx.restore();
        }

        const targets = targetPointsRef.current;
        const hasTargets = isIdle && targets.length > 0;

        particlesRef.current.forEach((particle, index) => {
            // Target Seeking Logic
            if (hasTargets) {
                // Assign a target based on particle index
                const targetIndex = Math.floor(index * (targets.length / particlesRef.current.length));
                const target = targets[targetIndex % targets.length];

                const dx = target.x - particle.x;
                const dy = target.y - particle.y;

                // Spring force towards target
                particle.vx += dx * 0.005;
                particle.vy += dy * 0.005;

                // Dampen velocity heavily when forming shape
                particle.vx *= 0.92;
                particle.vy *= 0.92;
            } else {
                // Normal brownian motion
                particle.vx *= 0.995;
                particle.vy *= 0.995;

                // Wrap around edges
                if (particle.x < -10) particle.x = width + 10;
                if (particle.x > width + 10) particle.x = -10;
                if (particle.y < -10) particle.y = height + 10;
                if (particle.y > height + 10) particle.y = -10;
            }

            // Mouse interaction (Removed repulsion)
            /* 
            // Optional: Add attraction or other interaction here if desired later
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            */

            // Move
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Draw
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 180, 190, ${particle.alpha})`;
            ctx.fill();
        });

        // Draw connections (Only when NOT forming text to avoid mess)
        if (!hasTargets) {
            for (let i = 0; i < particlesRef.current.length; i++) {
                const p1 = particlesRef.current[i];
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const p2 = particlesRef.current[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 60) {
                        const alpha = 0.08 * (1 - distance / 60);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(180, 180, 190, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [text, isIdle]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(canvas.width, canvas.height);
    }, [initParticles]);

    useEffect(() => {
        handleResize();
        resetIdleTimer();

        const handleInput = (e: MouseEvent | TouchEvent) => {
            if (e instanceof MouseEvent) {
                mouseRef.current.x = e.clientX;
                mouseRef.current.y = e.clientY;
            }
            resetIdleTimer();
        };

        window.addEventListener('mousemove', handleInput);
        window.addEventListener('mousedown', handleInput);
        window.addEventListener('touchstart', handleInput);
        window.addEventListener('scroll', resetIdleTimer, { passive: true });
        window.addEventListener('resize', handleResize);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleInput);
            window.removeEventListener('mousedown', handleInput);
            window.removeEventListener('touchstart', handleInput);
            window.removeEventListener('scroll', resetIdleTimer);
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [handleResize, animate, resetIdleTimer]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};
