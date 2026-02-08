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
const IDLE_TIMEOUT = 60000; // 1 minute

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

    // Generate Target Points from Text Edges
    const generateTargetPoints = useCallback((width: number, height: number, textToRender: string) => {
        if (!textToRender) return;

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        // "Professional Luxury" - Wide tracking, Orbitron
        ctx.font = 'bold 25vw "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2; // Thin edge
        ctx.strokeStyle = 'white';
        // Add extra spacing if supported, or just rely on font width
        // Canvas doesn't support letter-spacing natively easily, so we rely on the wide font definition
        ctx.strokeText(textToRender, width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height).data;
        const points: { x: number, y: number }[] = [];

        // Sample pixels - Edge detection via stroke
        // We need enough points to cover the edge
        const step = 2;

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                // Check for non-transparent pixel (the stroke)
                if (imageData[(y * width + x) * 4 + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }

        // Shuffle points to distribute particles randomly along the edge
        for (let i = points.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [points[i], points[j]] = [points[j], points[i]];
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

    // Spawn burst particles
    const spawnBurst = useCallback((x: number, y: number, count: number = 20) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = Math.random() * 4 + 2;
            particlesRef.current.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 1.5 + 0.5,
                alpha: 0.5,
                baseAlpha: 0.5,
            });
        }
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const mouse = mouseRef.current;
        const scrollVelocity = scrollVelocityRef.current;

        ctx.clearRect(0, 0, width, height);

        // Draw Watermark (Background) - Subtle
        if (text) {
            ctx.save();
            ctx.font = 'bold 25vw "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.fillText(text, width / 2, height / 2);
            ctx.restore();
        }

        // Keep only reasonable number of particles
        if (particlesRef.current.length > PARTICLE_COUNT + 100) {
            particlesRef.current = particlesRef.current.slice(-PARTICLE_COUNT);
        }

        const targets = targetPointsRef.current;
        const hasTargets = isIdle && targets.length > 0;

        particlesRef.current.forEach((particle, index) => {
            // IDLE BEHAVIOR: Drift to Edge Targets
            if (hasTargets) {
                // Loop targets so EVERY particle has a spot
                const target = targets[index % targets.length];

                const dx = target.x - particle.x;
                const dy = target.y - particle.y;

                // Gentle attraction to target
                particle.vx += dx * 0.002;
                particle.vy += dy * 0.002;

                // Extra damping to settle
                particle.vx *= 0.96;
                particle.vy *= 0.96;
            }

            // ACTIVE BEHAVIOR: Interaction (Preserved from original)
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const force = (maxDistance - distance) / maxDistance;

                if (mouse.isClicking) {
                    particle.vx -= Math.cos(angle) * force * 0.8;
                    particle.vy -= Math.sin(angle) * force * 0.8;
                } else {
                    // Attraction on hover (Original Behavior)
                    particle.vx += Math.cos(angle) * force * 0.02;
                    particle.vy += Math.sin(angle) * force * 0.02;
                }

                particle.alpha = Math.min(0.6, particle.baseAlpha + force * 0.2);
            } else if (!hasTargets) {
                // Only decay alpha if not interacting AND not idling
                // If idling, we want them visible
                particle.alpha += (particle.baseAlpha - particle.alpha) * 0.05;
            }

            // Scroll effect
            if (Math.abs(scrollVelocity) > 0.5) {
                particle.vy += scrollVelocity * 0.008;
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Friction (Base friction, less if idling to allow settling)
            if (!hasTargets) {
                particle.vx *= 0.995;
                particle.vy *= 0.995;
            }

            // Wrap around edges
            if (particle.x < -10) particle.x = width + 10;
            if (particle.x > width + 10) particle.x = -10;
            if (particle.y < -10) particle.y = height + 10;
            if (particle.y > height + 10) particle.y = -10;

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 180, 190, ${particle.alpha})`;
            ctx.fill();
        });

        // Draw connections (Disable when idling to act as cleaner outline)
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

        // Decay scroll velocity
        scrollVelocityRef.current *= 0.95;

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
        window.addEventListener('mouseup', () => { mouseRef.current.isClicking = false; });
        window.addEventListener('touchstart', handleInput);
        window.addEventListener('scroll', resetIdleTimer, { passive: true });
        window.addEventListener('resize', handleResize);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleInput);
            window.removeEventListener('mousedown', handleInput);
            window.removeEventListener('mouseup', () => { });
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
