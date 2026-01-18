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

            {/* Subtle gradient glows - responsive for mobile */}
            <div className="absolute -top-32 -right-32 md:-top-64 md:-right-64 w-64 h-64 md:w-[500px] md:h-[500px] bg-gradient-to-br from-teal-600/20 to-cyan-600/15 rounded-full blur-[80px] md:blur-[120px]"></div>
            <div className="absolute -bottom-24 -left-24 md:-bottom-48 md:-left-48 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-br from-teal-500/15 to-cyan-500/10 rounded-full blur-2xl md:blur-3xl"></div>

            {/* CSS for floating animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-15px) rotate(3deg); }
                    50% { transform: translateY(-8px) rotate(-2deg); }
                    75% { transform: translateY(-20px) rotate(2deg); }
                }
            `}</style>
        </div>
    );
};

export default BackgroundEffects;
