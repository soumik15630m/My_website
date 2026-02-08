import React, { useRef, useEffect, useCallback } from 'react';

// Particle mode types
export type ParticleMode = 'default' | 'aurora' | 'antigravity' | 'trail';

interface TrailParticle {
    x: number;
    y: number;
    size: number;
    alpha: number;
    life: number;
    maxLife: number;
    char: string;
    rotation: number;
}

interface ParticleFieldProps {
    mode?: ParticleMode;
}

// Tech/code themed characters for a systems engineer portfolio
const TECH_CHARS = ['0', '1', '>', '<', '/', '*', '+', '#', '.', '•'];

export const ParticleField: React.FC<ParticleFieldProps> = ({ mode = 'trail' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
    const trailParticlesRef = useRef<TrailParticle[]>([]);
    const animationRef = useRef<number>();
    const lastSpawnTime = useRef(0);

    // Spawn trail particles
    const spawnTrailParticle = useCallback((x: number, y: number) => {
        const char = TECH_CHARS[Math.floor(Math.random() * TECH_CHARS.length)];

        // Random offset from cursor
        const offsetX = (Math.random() - 0.5) * 25;
        const offsetY = (Math.random() - 0.5) * 25;

        trailParticlesRef.current.push({
            x: x + offsetX,
            y: y + offsetY,
            size: Math.random() * 10 + 8,
            alpha: 0.7,
            life: 0,
            maxLife: Math.random() * 50 + 30,
            char,
            rotation: (Math.random() - 0.5) * 0.3,
        });
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const mouse = mouseRef.current;
        const now = Date.now();

        // Spawn new trail particles when mouse moves
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 3 && now - lastSpawnTime.current > 40) {
            const particlesToSpawn = Math.min(Math.floor(speed / 8) + 1, 3);
            for (let i = 0; i < particlesToSpawn; i++) {
                spawnTrailParticle(mouse.x, mouse.y);
            }
            lastSpawnTime.current = now;
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

        // Limit particles
        if (trailParticlesRef.current.length > 60) {
            trailParticlesRef.current = trailParticlesRef.current.slice(-50);
        }

        // Update and draw trail particles
        trailParticlesRef.current = trailParticlesRef.current.filter((particle) => {
            particle.life++;

            // Calculate life progress (0 to 1)
            const lifeProgress = particle.life / particle.maxLife;

            // Smooth fade out
            particle.alpha = Math.max(0, 0.6 * (1 - lifeProgress));

            // Slight upward drift
            particle.y -= 0.3;
            particle.x += Math.sin(particle.life * 0.03) * 0.15;

            // Draw character
            if (particle.alpha > 0.01) {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);

                ctx.font = `${particle.size}px "JetBrains Mono", "Fira Code", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Subtle glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = `rgba(150, 170, 200, ${particle.alpha * 0.5})`;

                // Monochrome tech color
                ctx.fillStyle = `rgba(160, 175, 200, ${particle.alpha})`;
                ctx.fillText(particle.char, 0, 0);

                ctx.restore();
            }

            return particle.life < particle.maxLife;
        });

        // Reset shadow
        ctx.shadowBlur = 0;

        animationRef.current = requestAnimationFrame(animate);
    }, [spawnTrailParticle]);

    // Event handlers
    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    }, []);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    useEffect(() => {
        handleResize();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [handleMouseMove, handleResize, animate]);

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
