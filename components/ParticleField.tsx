import React, { useRef, useEffect, useCallback } from 'react';

// Particle mode types matches Dashboard settings
export type ParticleMode = 'default' | 'aurora' | 'antigravity' | 'trail';

interface BaseParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    life?: number;
    maxLife?: number;
    rotation?: number;
    color?: string;
    char?: string;
}

interface ParticleFieldProps {
    mode?: ParticleMode;
}

// Tech/code themed characters for trail mode
const TECH_CHARS = ['0', '1', '>', '<', '/', '*', '+', '#', '.', '•', '{', '}'];

export const ParticleField: React.FC<ParticleFieldProps> = ({ mode = 'default' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
    const particlesRef = useRef<BaseParticle[]>([]);
    const animationRef = useRef<number>();
    const modeRef = useRef(mode);
    const lastSpawnTime = useRef(0);
    const initializedRef = useRef(false);

    // Update mode ref when prop changes
    useEffect(() => {
        modeRef.current = mode;
        // Re-initialize particles on mode change
        initializedRef.current = false;
    }, [mode]);

    // Initialize particles based on mode
    const initParticles = useCallback((width: number, height: number, currentMode: ParticleMode) => {
        particlesRef.current = [];

        if (currentMode === 'default') {
            // Mesh Network
            const count = Math.min(Math.floor((width * height) / 15000), 100);
            for (let i = 0; i < count; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.5 + 0.1,
                });
            }
        } else if (currentMode === 'aurora') {
            // Aurora Blobs
            const count = 15;
            const colors = ['#4f46e5', '#8b5cf6', '#06b6d4', '#ec4899']; // Indigo, Violet, Cyan, Pink
            for (let i = 0; i < count; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2,
                    size: Math.random() * 300 + 100,
                    alpha: Math.random() * 0.15 + 0.05,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        } else if (currentMode === 'antigravity') {
            // Floating Crosses
            const count = Math.min(Math.floor((width * height) / 10000), 80);
            for (let i = 0; i < count; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: 0,
                    vy: (Math.random() * -0.5) - 0.1, // Float up
                    size: Math.random() * 10 + 5,
                    alpha: Math.random() * 0.4 + 0.1,
                    rotation: Math.random() * Math.PI,
                    color: Math.random() > 0.5 ? '#64748b' : '#94a3b8' // Slate colors
                });
            }
        }
        // Trail mode initializes empty and spawns on move

        initializedRef.current = true;
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const currentMode = modeRef.current; // Use ref for current mode

        // Check initialization
        if (!initializedRef.current) {
            initParticles(width, height, currentMode);
        }

        // Clear canvas with trail effect for some modes
        if (currentMode === 'trail') {
            ctx.clearRect(0, 0, width, height);
        } else {
            ctx.clearRect(0, 0, width, height);
        }

        const mouse = mouseRef.current;
        const now = Date.now();

        // ------------------ TRAIL MODE ------------------
        if (currentMode === 'trail') {
            // Spawn logic
            const dx = mouse.x - mouse.prevX;
            const dy = mouse.y - mouse.prevY;
            const speed = Math.sqrt(dx * dx + dy * dy);

            if (speed > 3 && now - lastSpawnTime.current > 40) {
                const particlesToSpawn = Math.min(Math.floor(speed / 8) + 1, 3);
                for (let i = 0; i < particlesToSpawn; i++) {
                    const char = TECH_CHARS[Math.floor(Math.random() * TECH_CHARS.length)];
                    particlesRef.current.push({
                        x: mouse.x + (Math.random() - 0.5) * 25,
                        y: mouse.y + (Math.random() - 0.5) * 25,
                        vx: 0,
                        vy: -0.3, // Drift up
                        size: Math.random() * 10 + 8,
                        alpha: 0.7,
                        life: 0,
                        maxLife: Math.random() * 50 + 30,
                        char,
                        rotation: (Math.random() - 0.5) * 0.3,
                    });
                }
                lastSpawnTime.current = now;
            }

            // Update & Draw
            particlesRef.current = particlesRef.current.filter((p) => {
                p.life = (p.life || 0) + 1;
                const lifeProgress = p.life / (p.maxLife || 100);
                p.alpha = Math.max(0, 0.6 * (1 - lifeProgress));
                p.y += p.vy;
                p.x += Math.sin(p.life * 0.03) * 0.15;

                if (p.alpha > 0.01) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    ctx.font = `${p.size}px "JetBrains Mono", monospace`;
                    ctx.fillStyle = `rgba(160, 175, 200, ${p.alpha})`;
                    ctx.shadowColor = `rgba(150, 170, 200, ${p.alpha * 0.5})`;
                    ctx.shadowBlur = 8;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(p.char || '.', 0, 0);
                    ctx.restore();
                }
                return p.life < (p.maxLife || 100);
            });
        }
        // ------------------ DEFAULT (MESH) MODE ------------------
        else if (currentMode === 'default') {
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.vx -= (dx / dist) * force * 0.05;
                    p.vy -= (dy / dist) * force * 0.05;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
                ctx.fill();
            });

            // Draw Connections
            particlesRef.current.forEach((p, i) => {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const p2 = particlesRef.current[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(148, 163, 184, ${(1 - dist / 120) * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });
        }
        // ------------------ AURORA MODE ------------------
        else if (currentMode === 'aurora') {
            // Use composite operation for additive blending
            ctx.globalCompositeOperation = 'screen';

            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < -p.size) p.x = width + p.size;
                if (p.x > width + p.size) p.x = -p.size;
                if (p.y < -p.size) p.y = height + p.size;
                if (p.y > height + p.size) p.y = -p.size;

                // Mouse move slightly attracts
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    p.x += (dx / dist) * 0.5;
                    p.y += (dy / dist) * 0.5;
                }

                // Draw gradient blob
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, p.color || 'white');
                gradient.addColorStop(1, 'transparent');

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = gradient;
                ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            });

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }
        // ------------------ ANTIGRAVITY MODE ------------------
        else if (currentMode === 'antigravity') {
            particlesRef.current.forEach(p => {
                p.y += p.vy; // Float up

                // Reset if off top
                if (p.y < -50) {
                    p.y = height + 50;
                    p.x = Math.random() * width;
                }

                // Antigravity: Flee from mouse
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = 200;

                if (dist < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const force = (minDist - dist) / minDist;
                    const push = force * 8; // Strong push

                    p.x += Math.cos(angle) * push;
                    p.y += Math.sin(angle) * push;

                    // Add rotation spin
                    p.rotation = (p.rotation || 0) + 0.1;
                } else {
                    // Return to slow spin
                    p.rotation = (p.rotation || 0) + 0.01;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation || 0);

                // Draw Plus Sign
                ctx.strokeStyle = p.color || '#94a3b8';
                ctx.lineWidth = 2;
                ctx.globalAlpha = p.alpha;

                const s = p.size;
                ctx.beginPath();
                ctx.moveTo(-s, 0);
                ctx.lineTo(s, 0);
                ctx.moveTo(0, -s);
                ctx.lineTo(0, s);
                ctx.stroke();

                ctx.restore();
            });
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

        animationRef.current = requestAnimationFrame(animate);
    }, [initParticles]); // Deps can be minimal as we use refs

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
        // Re-init on significant resize? Maybe just let them float.
        initializedRef.current = false;
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
                background: mode === 'aurora' ? 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)' : 'transparent',
                willChange: 'transform',
            }}
        />
    );
};
