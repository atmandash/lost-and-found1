import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const ConstellationEffect = () => {
    const canvasRef = useRef(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Safety check

        const ctx = canvas.getContext('2d');
        if (!ctx) return; // Safety check

        let animationFrameId;
        let particles = [];

        // Configuration - Bigger and more visible
        const particleCount = window.innerWidth < 768 ? 40 : 100; // More particles
        const connectionDistance = window.innerWidth < 768 ? 120 : 200; // Longer connections

        // Resize hanlder
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2.5 + 1.5; // Medium dots (1.5-4px)
                // Colorful particles: Teal, Indigo, Purple
                const colors = [
                    'rgba(45, 212, 191, ',  // Teal
                    'rgba(99, 102, 241, ',  // Indigo
                    'rgba(168, 85, 247, '   // Purple
                ];
                this.colorBase = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                // Dynamic opacity - more visible
                const opacity = isDarkMode ? 0.8 : 0.6;
                ctx.fillStyle = this.colorBase + opacity + ')';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections first (behind dots)
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        const opacity = (1 - distance / connectionDistance) * 0.5; // More visible lines
                        ctx.strokeStyle = isDarkMode
                            ? `rgba(148, 163, 184, ${opacity})` // Slate-400 for dark mode
                            : `rgba(100, 116, 139, ${opacity})`; // Slate-500 for light mode
                        ctx.lineWidth = 1.5; // Thicker lines
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-60"
        />
    );
};

export default ConstellationEffect;
