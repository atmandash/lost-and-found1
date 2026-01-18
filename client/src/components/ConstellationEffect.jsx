import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const ConstellationEffect = () => {
    const canvasRef = useRef(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let particles = [];

        // Configuration - Community network
        const particleCount = window.innerWidth < 768 ? 30 : 70;
        const connectionDistance = window.innerWidth < 768 ? 150 : 250;

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
                this.vx = (Math.random() - 0.5) * 0.3; // Slower, calmer movement
                this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 1.5 + 1; // Smaller dots 1-2.5px

                // Two types: "Seekers" (looking for items) and "Finders" (found items)
                const isFinder = Math.random() > 0.5;
                this.colorBase = isFinder
                    ? 'rgba(34, 197, 94, '   // Green for finders
                    : 'rgba(99, 102, 241, '; // Indigo for seekers
                this.type = isFinder ? 'finder' : 'seeker';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges gently
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                // Draw a subtle glow first
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 3
                );
                gradient.addColorStop(0, this.colorBase + '0.4)');
                gradient.addColorStop(1, this.colorBase + '0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(this.x - this.size * 3, this.y - this.size * 3, this.size * 6, this.size * 6);

                // Draw the main node
                ctx.beginPath();
                const opacity = isDarkMode ? 0.8 : 0.6;
                ctx.fillStyle = this.colorBase + opacity + ')';
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections first (behind nodes)
            // Connections represent people helping each other
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        const opacity = (1 - distance / connectionDistance) * 0.4;

                        // Special glow when finder connects to seeker
                        if (p1.type !== p2.type) {
                            // Connection between finder and seeker - highlight it!
                            ctx.strokeStyle = `rgba(167, 139, 250, ${opacity * 1.5})`; // Purple glow
                            ctx.lineWidth = 2;
                        } else {
                            // Same type connection - subtle
                            ctx.strokeStyle = isDarkMode
                                ? `rgba(148, 163, 184, ${opacity * 0.6})`
                                : `rgba(100, 116, 139, ${opacity * 0.6})`;
                            ctx.lineWidth = 1;
                        }

                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            // Update and draw particles (people nodes)
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{ opacity: 0.7 }}
        />
    );
};

export default ConstellationEffect;
