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

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 250;
const IDLE_TIMEOUT = 60000; // 1 minute

interface ParticleFieldProps {
    text?: string;
}

export const ParticleField: React.FC<ParticleFieldProps & { paused?: boolean }> = ({ text = "STK", paused = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, isClicking: false });
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const scrollVelocityRef = useRef(0);
    const lastScrollY = useRef(0);
    const lastTimeRef = useRef(0); // For FPS throttling

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
        const ctx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Minimalist - Inter, Heavy weight, Wide spacing
        ctx.font = '900 25vw "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.strokeText(textToRender, width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height).data;
        const points: { x: number, y: number }[] = [];

        // Sample pixels
        const step = 4; // Increased step for performance (less points)

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                if (imageData[(y * width + x) * 4 + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }

        // Shuffle points
        for (let i = points.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [points[i], points[j]] = [points[j], points[i]];
        }

        targetPointsRef.current = points;
    }, []);

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        const isMobile = width < 768;
        const count = isMobile ? 30 : 150; // Optimized counts

        particlesRef.current = [];
        for (let i = 0; i < count; i++) {
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
    const animate = useCallback((timestamp: number) => {
        if (paused) return; // Stop completely if paused

        // FPS Throttle (60 FPS)
        const elapsed = timestamp - lastTimeRef.current;
        const fpsInterval = 1000 / 60;

        if (elapsed < fpsInterval) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        lastTimeRef.current = timestamp - (elapsed % fpsInterval);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const mouse = mouseRef.current;
        const scrollVelocity = scrollVelocityRef.current;

        ctx.clearRect(0, 0, width, height);

        // Draw Watermark (Background) - Subtle, Minimalist
        if (text) {
            ctx.save();
            ctx.font = '900 25vw "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.fillText(text, width / 2, height / 2);
            ctx.restore();
        }

        // Limit maximum particles (cleanup bursts)
        const maxParticles = width < 768 ? 50 : 200;
        if (particlesRef.current.length > maxParticles) {
            particlesRef.current = particlesRef.current.slice(-maxParticles);
        }

        const targets = targetPointsRef.current;
        const hasTargets = isIdle && targets.length > 0;

        particlesRef.current.forEach((particle, index) => {
            // IDLE BEHAVIOR: Smooth Drift to Edge Targets
            if (hasTargets) {
                const target = targets[index % targets.length];
                const dx = target.x - particle.x;
                const dy = target.y - particle.y;

                // Very gentle attraction (0.005) - Smooth drift, no snapping
                const spring = 0.005;
                particle.vx += dx * spring;
                particle.vy += dy * spring;

                // Strong damping to prevent sloshing (0.90)
                particle.vx *= 0.90;
                particle.vy *= 0.90;

                // VELOCITY CAP: Prevent "teleporting" from far distances
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                const maxSpeed = 5;
                if (speed > maxSpeed) {
                    particle.vx = (particle.vx / speed) * maxSpeed;
                    particle.vy = (particle.vy / speed) * maxSpeed;
                }
            }

            // ACTIVE BEHAVIOR: Mouse Interaction
            const interactionStrength = hasTargets ? 0.1 : 1.0;

            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;

            // Optimization: Simple box check before expensive sqrt
            if (Math.abs(dx) < 150 && Math.abs(dy) < 150) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const force = (maxDistance - distance) / maxDistance;

                    if (mouse.isClicking) {
                        particle.vx -= Math.cos(angle) * force * 0.8 * interactionStrength;
                        particle.vy -= Math.sin(angle) * force * 0.8 * interactionStrength;
                    } else {
                        // Attraction on hover
                        particle.vx += Math.cos(angle) * force * 0.02 * interactionStrength;
                        particle.vy += Math.sin(angle) * force * 0.02 * interactionStrength;
                    }

                    // Only brighten if Active OR if mouse is VERY close/strong interaction
                    if (!hasTargets) {
                        particle.alpha = Math.min(0.6, particle.baseAlpha + force * 0.2);
                    }
                }
            } else if (!hasTargets) {
                particle.alpha += (particle.baseAlpha - particle.alpha) * 0.05;
            }

            // Scroll effect with Hard Cap
            if (Math.abs(scrollVelocity) > 0.5) {
                // Cap the scroll influence to prevent chaos
                const scrollInfluence = Math.max(-2, Math.min(2, scrollVelocity * 0.008));
                particle.vy += scrollInfluence;
            }

            // Global Velocity Cap (rendering visual appeal)
            const MAX_VELOCITY = 4;
            if (!hasTargets) {
                particle.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, particle.vx));
                particle.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, particle.vy));
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Friction
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

        // Draw connections (Disable when idling) - OPTIMIZED
        if (!hasTargets) {
            const particles = particlesRef.current;
            const len = particles.length;

            for (let i = 0; i < len; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < len; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;

                    // OPTIMIZATION: Spatial Cutoff - Skip expensive Math.sqrt if bounding box is too large
                    if (Math.abs(dx) > 60 || Math.abs(dy) > 60) continue;

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
    }, [text, isIdle, paused]);

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

        const handleMouseDown = (e: MouseEvent) => {
            mouseRef.current.isClicking = true;
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            spawnBurst(e.clientX, e.clientY, 25);
            resetIdleTimer();
        };

        const handleMouseUp = () => {
            mouseRef.current.isClicking = false;
            resetIdleTimer();
        };

        const handleScroll = () => {
            const delta = window.scrollY - lastScrollY.current;
            scrollVelocityRef.current = delta;
            lastScrollY.current = window.scrollY;
            resetIdleTimer();
        };

        window.addEventListener('mousemove', handleInput);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchstart', handleInput);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        // Start loop
        lastTimeRef.current = performance.now();
        if (!paused) {
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            window.removeEventListener('mousemove', handleInput);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchstart', handleInput);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [handleResize, animate, resetIdleTimer, spawnBurst, paused]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent', willChange: 'transform' }}
        />
    );
};
