import React from 'react';
import { MapPin, Search, Package, Eye, MessageCircle, Shield, Award, Bell, Key, Compass, Tag, Bookmark, Heart, Star, Zap, Target } from 'lucide-react';

const BackgroundEffects = () => {
    // Floating icons representing the Lost & Found theme - more icons, bigger sizes
    const floatingIcons = [
        { Icon: MapPin, x: '8%', y: '12%', size: 32, delay: 0, color: 'text-red-400/25' },
        { Icon: Search, x: '88%', y: '18%', size: 36, delay: 1, color: 'text-blue-400/25' },
        { Icon: Package, x: '15%', y: '65%', size: 30, delay: 2, color: 'text-green-400/25' },
        { Icon: Eye, x: '78%', y: '60%', size: 34, delay: 0.5, color: 'text-purple-400/25' },
        { Icon: MessageCircle, x: '45%', y: '82%', size: 28, delay: 1.5, color: 'text-cyan-400/25' },
        { Icon: Shield, x: '92%', y: '42%', size: 32, delay: 2.5, color: 'text-yellow-400/25' },
        { Icon: Award, x: '5%', y: '40%', size: 30, delay: 0.8, color: 'text-orange-400/25' },
        { Icon: Bell, x: '55%', y: '8%', size: 32, delay: 1.8, color: 'text-pink-400/25' },
        { Icon: Key, x: '35%', y: '28%', size: 28, delay: 3, color: 'text-amber-400/25' },
        { Icon: Compass, x: '25%', y: '50%', size: 30, delay: 2.2, color: 'text-indigo-400/25' },
        { Icon: Tag, x: '70%', y: '75%', size: 26, delay: 1.2, color: 'text-teal-400/25' },
        { Icon: Bookmark, x: '82%', y: '85%', size: 28, delay: 0.3, color: 'text-rose-400/25' },
        { Icon: Heart, x: '12%', y: '88%', size: 26, delay: 2.8, color: 'text-red-300/25' },
        { Icon: Star, x: '65%', y: '35%', size: 30, delay: 1.6, color: 'text-yellow-300/25' },
        { Icon: Zap, x: '40%', y: '55%', size: 28, delay: 0.7, color: 'text-cyan-300/25' },
        { Icon: Target, x: '95%', y: '12%', size: 32, delay: 2.4, color: 'text-emerald-400/25' },
        { Icon: MapPin, x: '52%', y: '45%', size: 24, delay: 3.2, color: 'text-violet-400/20' },
        { Icon: Search, x: '3%', y: '75%', size: 26, delay: 1.1, color: 'text-sky-400/20' },
    ];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Floating Lost & Found Icons */}
            {floatingIcons.map((item, idx) => (
                <div
                    key={idx}
                    className={`absolute ${item.color}`}
                    style={{
                        left: item.x,
                        top: item.y,
                        animation: `float ${6 + (idx % 4)}s ease-in-out infinite`,
                        animationDelay: `${item.delay}s`,
                    }}
                >
                    <item.Icon size={item.size} strokeWidth={1.5} />
                </div>
            ))}

            {/* Pulsating Teal Blob - Top Right */}
            <div
                className="absolute -top-20 -right-20 md:-top-28 md:-right-28 w-56 h-56 md:w-[380px] md:h-[380px] rounded-full blur-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
                    animation: 'blobPulse1 5s ease-in-out infinite',
                }}
            />

            {/* Pulsating Cyan Blob - Bottom Left */}
            <div
                className="absolute -bottom-16 -left-16 md:-bottom-24 md:-left-24 w-48 h-48 md:w-[340px] md:h-[340px] rounded-full blur-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(20, 184, 166, 0.12) 50%, transparent 70%)',
                    animation: 'blobPulse2 7s ease-in-out infinite',
                }}
            />

            {/* Pulsating Purple Blob - Center Left */}
            <div
                className="absolute top-1/3 -left-12 md:-left-20 w-40 h-40 md:w-[280px] md:h-[280px] rounded-full blur-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.1) 50%, transparent 70%)',
                    animation: 'blobPulse3 9s ease-in-out infinite',
                }}
            />

            {/* Pulsating Emerald Blob - Top Center */}
            <div
                className="absolute -top-10 left-1/3 md:left-1/4 w-36 h-36 md:w-[260px] md:h-[260px] rounded-full blur-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 50%, transparent 70%)',
                    animation: 'blobPulse4 6s ease-in-out infinite',
                }}
            />

            {/* Pulsating Amber Blob - Bottom Right */}
            <div
                className="absolute bottom-1/4 -right-10 md:-right-16 w-32 h-32 md:w-[220px] md:h-[220px] rounded-full blur-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.08) 50%, transparent 70%)',
                    animation: 'blobPulse5 8s ease-in-out infinite',
                }}
            />

            {/* CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-15px) rotate(3deg); }
                    50% { transform: translateY(-8px) rotate(-2deg); }
                    75% { transform: translateY(-20px) rotate(2deg); }
                }
                
                @keyframes blobPulse1 {
                    0%, 100% { 
                        opacity: 0.25;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.6;
                        transform: scale(1.08);
                    }
                }
                
                @keyframes blobPulse2 {
                    0%, 100% { 
                        opacity: 0.2;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.55;
                        transform: scale(1.1);
                    }
                }
                
                @keyframes blobPulse3 {
                    0%, 100% { 
                        opacity: 0.15;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.5;
                        transform: scale(1.12);
                    }
                }
                
                @keyframes blobPulse4 {
                    0%, 100% { 
                        opacity: 0.18;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.52;
                        transform: scale(1.08);
                    }
                }
                
                @keyframes blobPulse5 {
                    0%, 100% { 
                        opacity: 0.15;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.45;
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default BackgroundEffects;
