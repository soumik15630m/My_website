import React, { useRef, useEffect, useCallback } from 'react';

// Particle mode types
export type ParticleMode = 'default' | 'aurora' | 'antigravity';

interface Particle {
    x: number;
    y: number;
    homeX: number;  // Home position for return behavior
    homeY: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    baseAlpha: number;
    layer: number;
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

const PARTICLE_COUNT = 120;
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
        { speed: 0.3, sizeMultiplier: 0.5, alphaMultiplier: 0.4 },
        { speed: 0.6, sizeMultiplier: 0.8, alphaMultiplier: 0.7 },
        { speed: 1.0, sizeMultiplier: 1.2, alphaMultiplier: 1.0 },
    ];

    // Initialize particles based on mode
    const initParticles = useCallback((width: number, height: number) => {
        particlesRef.current = [];
        auroraBlobsRef.current = [];

        const count = mode === 'antigravity' ? 100 : PARTICLE_COUNT;

        for (let i = 0; i < count; i++) {
            const layer = mode === 'antigravity' ? 1 : Math.floor(Math.random() * 3);
            const config = layerConfigs[layer];

            // For antigravity: uniform distribution, larger '+' marks
            const size = mode === 'antigravity'
                ? Math.random() * 2 + 1.5
                : (Math.random() * 1.8 + 0.4) * config.sizeMultiplier;

            const baseAlpha = mode === 'antigravity'
                ? Math.random() * 0.4 + 0.3
                : (Math.random() * 0.3 + 0.1) * config.alphaMultiplier;

            const x = Math.random() * width;
            const y = Math.random() * height;

            particlesRef.current.push({
                x,
                y,
                homeX: x,  // Store home position
                homeY: y,
                vx: 0,
                vy: 0,
                size,
                alpha: baseAlpha,
                baseAlpha,
                layer,
            });
        }

        // Aurora blobs
        if (mode === 'aurora') {
            for (let i = 0; i < AURORA_BLOB_COUNT; i++) {
                auroraBlobsRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 200 + 150,
                    hue: Math.random() * 60 + 180,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }
    }, [mode]);

    // Spawn burst particles (for click effect)
    const spawnBurst = useCallback((x: number, y: number, count: number = 15) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = Math.random() * 6 + 3;
            const homeX = x + Math.cos(angle) * 200;
            const homeY = y + Math.sin(angle) * 200;

            particlesRef.current.push({
                x,
                y,
                homeX,
                homeY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2 + 1,
                alpha: 0.7,
                baseAlpha: 0.4,
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

        // Aurora blobs (background)
        if (mode === 'aurora') {
            auroraBlobsRef.current.forEach((blob) => {
                blob.x += blob.vx;
                blob.y += blob.vy;
                blob.phase += 0.01;

                if (blob.x < -blob.radius) blob.x = width + blob.radius;
                if (blob.x > width + blob.radius) blob.x = -blob.radius;
                if (blob.y < -blob.radius) blob.y = height + blob.radius;
                if (blob.y > height + blob.radius) blob.y = -blob.radius;

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

        // Keep particle count manageable
        const maxParticles = mode === 'antigravity' ? 150 : PARTICLE_COUNT + 50;
        if (particlesRef.current.length > maxParticles) {
            particlesRef.current = particlesRef.current.slice(-maxParticles);
        }

        // Setup glow for antigravity mode
        if (mode === 'antigravity') {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(200, 220, 255, 0.5)';
        }

        // Update and draw particles
        particlesRef.current.forEach((particle) => {
            const config = layerConfigs[particle.layer] || layerConfigs[1];

            // Mouse interaction
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (mode === 'antigravity') {
                // ANTIGRAVITY: Strong inverse-square repulsion
                const repulsionRadius = 200;

                if (distance < repulsionRadius && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    // Inverse-square force: stronger when closer
                    const force = Math.pow((repulsionRadius - distance) / repulsionRadius, 2) * 3;

                    particle.vx -= Math.cos(angle) * force;
                    particle.vy -= Math.sin(angle) * force;
                    particle.alpha = Math.min(0.9, particle.baseAlpha + force * 0.3);
                }

                // Return-to-home force (spring behavior)
                const homeDistX = particle.homeX - particle.x;
                const homeDistY = particle.homeY - particle.y;
                particle.vx += homeDistX * 0.02;
                particle.vy += homeDistY * 0.02;

                // Click burst effect
                if (mouse.isClicking && distance < 300 && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const force = (300 - distance) / 300 * 8;
                    particle.vx -= Math.cos(angle) * force;
                    particle.vy -= Math.sin(angle) * force;
                }

            } else {
                // Default/Aurora: gentle attraction/repulsion
                const maxDistance = 150;
                if (distance < maxDistance && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const force = (maxDistance - distance) / maxDistance * config.speed;

                    if (mouse.isClicking) {
                        particle.vx -= Math.cos(angle) * force * 0.8;
                        particle.vy -= Math.sin(angle) * force * 0.8;
                    } else {
                        particle.vx += Math.cos(angle) * force * 0.02;
                        particle.vy += Math.sin(angle) * force * 0.02;
                    }
                    particle.alpha = Math.min(0.6, particle.baseAlpha + force * 0.2);
                }
            }

            // Alpha decay
            particle.alpha += (particle.baseAlpha - particle.alpha) * 0.05;

            // Scroll effect
            if (Math.abs(scrollVelocity) > 0.5) {
                const scrollFactor = mode === 'antigravity' ? 0.001 : 0.002 * config.speed;
                particle.vy += scrollVelocity * scrollFactor;
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Friction (stronger for antigravity for smoother movement)
            const friction = mode === 'antigravity' ? 0.92 : 0.995;
            particle.vx *= friction;
            particle.vy *= friction;

            // Wrap around edges
            if (particle.x < -20) { particle.x = width + 20; particle.homeX = particle.x; }
            if (particle.x > width + 20) { particle.x = -20; particle.homeX = particle.x; }
            if (particle.y < -20) { particle.y = height + 20; particle.homeY = particle.y; }
            if (particle.y > height + 20) { particle.y = -20; particle.homeY = particle.y; }

            // Draw particle
            if (mode === 'antigravity') {
                // Draw '+' sign with glow
                const s = particle.size * 4;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(220, 230, 255, ${particle.alpha})`;
                ctx.lineWidth = particle.size * 0.4;
                ctx.lineCap = 'round';
                ctx.moveTo(particle.x - s, particle.y);
                ctx.lineTo(particle.x + s, particle.y);
                ctx.moveTo(particle.x, particle.y - s);
                ctx.lineTo(particle.x, particle.y + s);
                ctx.stroke();
            } else {
                // Draw circle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                if (mode === 'aurora') {
                    const hue = 200 + particle.layer * 20;
                    ctx.fillStyle = `hsla(${hue}, 30%, 70%, ${particle.alpha})`;
                } else {
                    ctx.fillStyle = `rgba(180, 180, 190, ${particle.alpha})`;
                }
                ctx.fill();
            }
        });

        // Reset shadow for connection lines
        ctx.shadowBlur = 0;

        // Draw constellation mesh
        const connectionDistance = mode === 'antigravity' ? 120 : 80;
        const connectionAlpha = mode === 'antigravity' ? 0.2 : 0.12;

        for (let i = 0; i < particlesRef.current.length; i++) {
            const p1 = particlesRef.current[i];

            // Limit connections per particle for performance
            let connections = 0;
            const maxConnections = mode === 'antigravity' ? 5 : 3;

            for (let j = i + 1; j < particlesRef.current.length && connections < maxConnections; j++) {
                const p2 = particlesRef.current[j];

                // Only connect nearby layers
                if (Math.abs(p1.layer - p2.layer) > 1) continue;

                const cdx = p1.x - p2.x;
                const cdy = p1.y - p2.y;
                const dist = Math.sqrt(cdx * cdx + cdy * cdy);

                if (dist < connectionDistance) {
                    connections++;
                    const alpha = connectionAlpha * (1 - dist / connectionDistance);

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);

                    if (mode === 'antigravity') {
                        ctx.strokeStyle = `rgba(180, 200, 255, ${alpha})`;
                        ctx.lineWidth = 0.8;
                    } else if (mode === 'aurora') {
                        ctx.strokeStyle = `hsla(210, 40%, 70%, ${alpha})`;
                        ctx.lineWidth = 0.5;
                    } else {
                        ctx.strokeStyle = `rgba(180, 180, 190, ${alpha})`;
                        ctx.lineWidth = 0.5;
                    }
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
        if (mode === 'antigravity') {
            spawnBurst(e.clientX, e.clientY, 12);
        } else {
            spawnBurst(e.clientX, e.clientY, 20);
        }
    }, [spawnBurst, mode]);

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
