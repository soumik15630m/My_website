import React, { useRef, useEffect, useCallback } from 'react';

// Particle mode types
export type ParticleMode = 'default' | 'aurora' | 'antigravity';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    baseAlpha: number;
    layer: number; // 0 = far, 1 = mid, 2 = near (for depth)
    color?: string;
}

interface AuroraBlob {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    hue: number;
    phase: number;
}

interface ParticleFieldProps {
    mode?: ParticleMode;
}

const PARTICLE_COUNT = 150;
const AURORA_BLOB_COUNT = 5;

export const ParticleField: React.FC<ParticleFieldProps> = ({ mode = 'default' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, isClicking: false });
    const particlesRef = useRef<Particle[]>([]);
    const auroraBlobsRef = useRef<AuroraBlob[]>([]);
    const animationRef = useRef<number>();
    const scrollVelocityRef = useRef(0);
    const lastScrollY = useRef(0);
    const timeRef = useRef(0);

    // Layer configurations for depth effect
    const layerConfigs = [
        { speed: 0.3, sizeMultiplier: 0.5, alphaMultiplier: 0.4 }, // Far
        { speed: 0.6, sizeMultiplier: 0.8, alphaMultiplier: 0.7 }, // Mid
        { speed: 1.0, sizeMultiplier: 1.2, alphaMultiplier: 1.0 }, // Near
    ];

    // Initialize particles based on mode
    const initParticles = useCallback((width: number, height: number) => {
        particlesRef.current = [];
        auroraBlobsRef.current = [];

        // Regular particles with depth layers
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const layer = Math.floor(Math.random() * 3);
            const config = layerConfigs[layer];
            const size = (Math.random() * 1.8 + 0.4) * config.sizeMultiplier;
            const baseAlpha = (Math.random() * 0.3 + 0.1) * config.alphaMultiplier;

            particlesRef.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.15 * config.speed,
                vy: (Math.random() - 0.5) * 0.15 * config.speed,
                size,
                alpha: baseAlpha,
                baseAlpha,
                layer,
            });
        }

        // Aurora blobs for aurora mode
        if (mode === 'aurora') {
            for (let i = 0; i < AURORA_BLOB_COUNT; i++) {
                auroraBlobsRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 200 + 150,
                    hue: Math.random() * 60 + 180, // Cyan to purple range
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }
    }, [mode]);

    // Draw '+' shape for antigravity mode
    const drawCross = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(180, 200, 255, ${alpha})`;
        ctx.lineWidth = size * 0.3;
        ctx.lineCap = 'round';
        // Horizontal line
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        // Vertical line
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
    };

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
                layer: 2,
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
        timeRef.current += 0.016;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw aurora blobs (background layer)
        if (mode === 'aurora') {
            auroraBlobsRef.current.forEach((blob) => {
                // Update blob position
                blob.x += blob.vx;
                blob.y += blob.vy;
                blob.phase += 0.01;

                // Wrap around
                if (blob.x < -blob.radius) blob.x = width + blob.radius;
                if (blob.x > width + blob.radius) blob.x = -blob.radius;
                if (blob.y < -blob.radius) blob.y = height + blob.radius;
                if (blob.y > height + blob.radius) blob.y = -blob.radius;

                // Draw gradient blob
                const pulsing = Math.sin(blob.phase) * 0.2 + 0.8;
                const gradient = ctx.createRadialGradient(
                    blob.x, blob.y, 0,
                    blob.x, blob.y, blob.radius * pulsing
                );
                gradient.addColorStop(0, `hsla(${blob.hue}, 70%, 50%, 0.08)`);
                gradient.addColorStop(0.5, `hsla(${blob.hue + 20}, 60%, 40%, 0.04)`);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.fillRect(blob.x - blob.radius, blob.y - blob.radius, blob.radius * 2, blob.radius * 2);
            });
        }

        // Keep only reasonable number of particles
        if (particlesRef.current.length > PARTICLE_COUNT + 100) {
            particlesRef.current = particlesRef.current.slice(-PARTICLE_COUNT);
        }

        // Sort particles by layer for proper depth rendering
        const sortedParticles = [...particlesRef.current].sort((a, b) => a.layer - b.layer);

        // Update and draw particles
        sortedParticles.forEach((particle) => {
            const config = layerConfigs[particle.layer] || layerConfigs[1];

            // Mouse interaction (stronger for closer particles)
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const force = (maxDistance - distance) / maxDistance;
                const layerForce = force * config.speed;

                if (mode === 'antigravity') {
                    // Antigravity: particles repel from mouse
                    particle.vx -= Math.cos(angle) * layerForce * 0.15;
                    particle.vy -= Math.sin(angle) * layerForce * 0.15;
                } else if (mouse.isClicking) {
                    particle.vx -= Math.cos(angle) * layerForce * 0.8;
                    particle.vy -= Math.sin(angle) * layerForce * 0.8;
                } else {
                    particle.vx += Math.cos(angle) * layerForce * 0.02;
                    particle.vy += Math.sin(angle) * layerForce * 0.02;
                }

                particle.alpha = Math.min(0.6, particle.baseAlpha + force * 0.2);
            } else {
                particle.alpha += (particle.baseAlpha - particle.alpha) * 0.05;
            }

            // Scroll effect - scaled by layer
            if (Math.abs(scrollVelocity) > 0.5) {
                particle.vy += scrollVelocity * 0.002 * config.speed;
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

            // Draw particle based on mode
            if (mode === 'antigravity') {
                drawCross(ctx, particle.x, particle.y, particle.size * 3, particle.alpha);
            } else {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                const hue = mode === 'aurora' ? 200 + particle.layer * 20 : 0;
                const sat = mode === 'aurora' ? '30%' : '0%';
                const light = mode === 'aurora' ? '70%' : '72%';
                ctx.fillStyle = mode === 'aurora'
                    ? `hsla(${hue}, ${sat}, ${light}, ${particle.alpha})`
                    : `rgba(180, 180, 190, ${particle.alpha})`;
                ctx.fill();
            }
        });

        // Draw connections (mesh effect) - only for nearby layers
        const connectionDistance = mode === 'antigravity' ? 100 : 80;
        const connectionAlphaBase = mode === 'antigravity' ? 0.15 : 0.12;

        for (let i = 0; i < particlesRef.current.length; i++) {
            const p1 = particlesRef.current[i];
            for (let j = i + 1; j < particlesRef.current.length; j++) {
                const p2 = particlesRef.current[j];

                // Only connect particles in same or adjacent layers
                if (Math.abs(p1.layer - p2.layer) > 1) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const alpha = connectionAlphaBase * (1 - distance / connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);

                    if (mode === 'aurora') {
                        ctx.strokeStyle = `hsla(210, 40%, 70%, ${alpha})`;
                    } else if (mode === 'antigravity') {
                        ctx.strokeStyle = `rgba(150, 180, 255, ${alpha})`;
                    } else {
                        ctx.strokeStyle = `rgba(180, 180, 190, ${alpha})`;
                    }
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Decay scroll velocity
        scrollVelocityRef.current *= 0.85;

        animationRef.current = requestAnimationFrame(animate);
    }, [mode]);

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
            style={{
                background: 'transparent',
                willChange: 'transform',
            }}
        />
    );
};
