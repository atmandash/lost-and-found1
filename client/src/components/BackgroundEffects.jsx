import React from 'react';
import { MapPin, Search, Package, Eye, MessageCircle, Shield, Award, Bell } from 'lucide-react';

const BackgroundEffects = () => {
    // Floating icons representing the Lost & Found theme
    const floatingIcons = [
        { Icon: MapPin, x: '10%', y: '15%', size: 24, delay: 0, color: 'text-red-400/30' },
        { Icon: Search, x: '85%', y: '20%', size: 28, delay: 1, color: 'text-blue-400/30' },
        { Icon: Package, x: '20%', y: '70%', size: 22, delay: 2, color: 'text-green-400/30' },
        { Icon: Eye, x: '75%', y: '65%', size: 26, delay: 0.5, color: 'text-purple-400/30' },
        { Icon: MessageCircle, x: '50%', y: '85%', size: 20, delay: 1.5, color: 'text-cyan-400/30' },
        { Icon: Shield, x: '90%', y: '45%', size: 24, delay: 2.5, color: 'text-yellow-400/30' },
        { Icon: Award, x: '5%', y: '45%', size: 22, delay: 0.8, color: 'text-orange-400/30' },
        { Icon: Bell, x: '60%', y: '10%', size: 24, delay: 1.8, color: 'text-pink-400/30' },
        { Icon: MapPin, x: '40%', y: '35%', size: 20, delay: 3, color: 'text-teal-400/25' },
        { Icon: Search, x: '30%', y: '55%', size: 18, delay: 2.2, color: 'text-indigo-400/25' },
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
                        animation: `float ${6 + idx}s ease-in-out infinite`,
                        animationDelay: `${item.delay}s`,
                    }}
                >
                    <item.Icon size={item.size} strokeWidth={1.5} />
                </div>
            ))}

            {/* Subtle gradient glows (keeping ambient feel) */}
            <div className="absolute -top-64 -right-64 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-cyan-600/15 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-48 -left-48 w-80 h-80 bg-gradient-to-br from-teal-500/15 to-blue-500/10 rounded-full blur-3xl"></div>

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
