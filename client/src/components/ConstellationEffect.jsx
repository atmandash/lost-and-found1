import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const ConstellationEffect = () => {
    const canvasRef = useRef(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Configuration
        const particleCount = window.innerWidth < 768 ? 30 : 80; // Fewer particles on mobile
        const connectionDistance = window.innerWidth < 768 ? 100 : 150;

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
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
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
                // Dynamic opacity based on theme but kept subtle
                const opacity = isDarkMode ? 0.6 : 0.4;
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
                        const opacity = (1 - distance / connectionDistance) * 0.2; // Very faint lines
                        ctx.strokeStyle = isDarkMode
                            ? `rgba(148, 163, 184, ${opacity})` // Slate-400 for dark mode
                            : `rgba(100, 116, 139, ${opacity})`; // Slate-500 for light mode
                        ctx.lineWidth = 1;
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
