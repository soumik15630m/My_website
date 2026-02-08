import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    baseAlpha: number;
}

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 100;
const CONNECTION_DISTANCE = 100;
const MOUSE_INFLUENCE_RADIUS = 150;

export const ParticleField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, isClicking: false });
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const scrollVelocityRef = useRef(0);
    const lastScrollY = useRef(0);

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
    }, []);

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

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Keep only reasonable number of particles
        if (particlesRef.current.length > PARTICLE_COUNT + 100) {
            particlesRef.current = particlesRef.current.slice(-PARTICLE_COUNT);
        }

        // Update and draw particles
        particlesRef.current.forEach((particle) => {
            // Mouse interaction
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
                    particle.vx += Math.cos(angle) * force * 0.02;
                    particle.vy += Math.sin(angle) * force * 0.02;
                }

                particle.alpha = Math.min(0.6, particle.baseAlpha + force * 0.2);
            } else {
                particle.alpha += (particle.baseAlpha - particle.alpha) * 0.05;
            }

            // Scroll effect
            if (Math.abs(scrollVelocity) > 0.5) {
                particle.vy += scrollVelocity * 0.008;
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Friction
            particle.vx *= 0.995;
            particle.vy *= 0.995;

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

        // Draw connections
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

        // Decay scroll velocity
        scrollVelocityRef.current *= 0.95;

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // Event handlers
    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        mouseRef.current.isClicking = true;
        spawnBurst(e.clientX, e.clientY, 25);
    }, [spawnBurst]);

    const handleMouseUp = useCallback(() => {
        mouseRef.current.isClicking = false;
    }, []);

    const handleScroll = useCallback(() => {
        const delta = window.scrollY - lastScrollY.current;
        scrollVelocityRef.current = delta;
        lastScrollY.current = window.scrollY;
    }, []);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(canvas.width, canvas.height);
    }, [initParticles]);

    useEffect(() => {
        handleResize();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [handleMouseMove, handleMouseDown, handleMouseUp, handleScroll, handleResize, animate]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};
