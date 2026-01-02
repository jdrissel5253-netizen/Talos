import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    targetAlpha: number;
}

const AirflowAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        const initParticles = () => {
            const particleCount = Math.floor((width * height) / 15000); // Responsive count
            particles = [];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: Math.random() * 0.5 + 0.1, // Horizontal flow
                    vy: (Math.random() - 0.5) * 0.2, // Slight vertical drift
                    size: Math.random() * 3 + 1, // Larger particles (was 2 + 0.5)
                    alpha: Math.random() * 0.7, // Higher base alpha
                    targetAlpha: Math.random() * 0.8 + 0.2
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(p => {
                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around screen
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
                if (p.y > height) p.y = 0;
                if (p.y < 0) p.y = height;

                // Pulse alpha
                if (Math.abs(p.alpha - p.targetAlpha) < 0.01) {
                    p.targetAlpha = Math.random() * 0.8 + 0.2; // Brighter min/max (was 0.5 + 0.1)
                }
                p.alpha += (p.targetAlpha - p.alpha) * 0.05;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(74, 222, 128, ${p.alpha})`; // #4ade80 (brand green)
                ctx.fill();

                // Draw connections (intelligent network effect)
                particles.forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        // Opacity based on distance
                        const alpha = (1 - distance / 100) * 0.15;
                        ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <CanvasContainer>
            <canvas ref={canvasRef} />
        </CanvasContainer>
    );
};

export default AirflowAnimation;
