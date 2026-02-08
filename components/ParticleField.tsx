import React, { useRef, useEffect, useCallback } from 'react';

// Particle mode types
export type ParticleMode = 'default' | 'aurora' | 'antigravity' | 'trail';

interface TrailParticle {
    x: number;
    y: number;
    size: number;
    alpha: number;
    hue: number;
    life: number;
    maxLife: number;
    pulsePhase: number;
    shape: 'circle' | 'heart' | 'star' | 'sparkle';
}

interface ParticleFieldProps {
    mode?: ParticleMode;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ mode = 'trail' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
    const trailParticlesRef = useRef<TrailParticle[]>([]);
    const animationRef = useRef<number>();
    const timeRef = useRef(0);
    const lastSpawnTime = useRef(0);

    // Draw heart shape
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, hue: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 15, size / 15);
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.bezierCurveTo(-10, -15, -15, 0, 0, 10);
        ctx.bezierCurveTo(15, 0, 10, -15, 0, -5);
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.fill();
        ctx.restore();
    };

    // Draw star shape
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, hue: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const radius = i === 0 ? size : size;
            if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${hue}, 70%, 70%, ${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${hue}, 70%, 60%, 0.6)`;
        ctx.fill();
        ctx.restore();
    };

    // Draw sparkle (4-pointed star)
    const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, hue: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        const points = 4;
        for (let i = 0; i <= points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const radius = i % 2 === 0 ? size : size * 0.3;
            if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${hue}, 60%, 75%, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${hue}, 60%, 70%, 0.5)`;
        ctx.fill();
        ctx.restore();
    };

    // Draw glowing circle
    const drawGlowCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, hue: number) => {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 75%, 70%, ${alpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${hue}, 75%, 60%, 0.7)`;
        ctx.fill();
    };

    // Spawn trail particles
    const spawnTrailParticle = useCallback((x: number, y: number) => {
        const shapes: TrailParticle['shape'][] = ['circle', 'heart', 'star', 'sparkle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        // Random offset from cursor
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;

        trailParticlesRef.current.push({
            x: x + offsetX,
            y: y + offsetY,
            size: Math.random() * 8 + 4,
            alpha: 0.9,
            hue: Math.random() * 60 + 300, // Pink to purple range
            life: 0,
            maxLife: Math.random() * 60 + 40,
            pulsePhase: Math.random() * Math.PI * 2,
            shape,
        });
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        timeRef.current += 0.016;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const mouse = mouseRef.current;
        const now = Date.now();

        // Spawn new trail particles when mouse moves
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 2 && now - lastSpawnTime.current > 30) {
            const particlesToSpawn = Math.min(Math.floor(speed / 5) + 1, 4);
            for (let i = 0; i < particlesToSpawn; i++) {
                spawnTrailParticle(mouse.x, mouse.y);
            }
            lastSpawnTime.current = now;
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

        // Limit particles
        if (trailParticlesRef.current.length > 100) {
            trailParticlesRef.current = trailParticlesRef.current.slice(-80);
        }

        // Update and draw trail particles
        trailParticlesRef.current = trailParticlesRef.current.filter((particle) => {
            particle.life++;

            // Calculate life progress (0 to 1)
            const lifeProgress = particle.life / particle.maxLife;

            // Fade out as life progresses
            particle.alpha = Math.max(0, 0.9 * (1 - lifeProgress));

            // Pulsing effect - heartbeat style
            const pulseSpeed = particle.shape === 'heart' ? 8 : 5;
            const pulse = Math.sin(particle.life * 0.15 * pulseSpeed + particle.pulsePhase);
            const pulsedSize = particle.size * (1 + pulse * 0.3);

            // Slight upward drift and fade
            particle.y -= 0.5 + lifeProgress * 0.5;
            particle.x += Math.sin(particle.life * 0.05) * 0.3;

            // Color shift over time
            particle.hue = (particle.hue + 0.5) % 360;

            // Draw based on shape
            if (particle.alpha > 0.01) {
                switch (particle.shape) {
                    case 'heart':
                        drawHeart(ctx, particle.x, particle.y, pulsedSize, particle.alpha, particle.hue);
                        break;
                    case 'star':
                        drawStar(ctx, particle.x, particle.y, pulsedSize, particle.alpha, particle.hue);
                        break;
                    case 'sparkle':
                        drawSparkle(ctx, particle.x, particle.y, pulsedSize, particle.alpha, particle.hue);
                        break;
                    default:
                        drawGlowCircle(ctx, particle.x, particle.y, pulsedSize, particle.alpha, particle.hue);
                }
            }

            return particle.life < particle.maxLife;
        });

        // Reset shadow for next frame
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
