import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, CheckCheck, MapPin, Shield, Bell, FileText, User, MessageCircle } from 'lucide-react';

const BackgroundEffects = () => {
    // Dark mode removed as requested
    const isDarkMode = false;
    const location = useLocation();
    const showBlobs = ['/', '/start'].includes(location.pathname);

    // Debug log
    console.log('Current Path:', location.pathname, 'Show Blobs:', showBlobs);

    return (
        <div key={location.pathname} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none h-full w-full">
            {/* Background Gradient - Soft & Premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

            {/* Dot Grid Pattern - The "Beautify" Upgrade */}
            <div className="absolute inset-0 z-0 opacity-[0.4]"
                style={{
                    backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                }}
            ></div>

            {/* Floating Icons - Visible Opacity */}
            <div className="absolute top-20 left-[10%] animate-float" style={{ animationDelay: '0s' }}>
                <Search className="w-12 h-12 opacity-40 text-indigo-400" />
            </div>
            <div className="absolute top-40 right-[15%] animate-float" style={{ animationDelay: '2s' }}>
                <CheckCheck className="w-16 h-16 opacity-40 text-green-400" />
            </div>
            <div className="absolute bottom-32 left-[20%] animate-float" style={{ animationDelay: '4s' }}>
                <MapPin className="w-14 h-14 opacity-40 text-purple-400" />
            </div>
            <div className="absolute bottom-20 right-[25%] animate-float" style={{ animationDelay: '1s' }}>
                <Shield className="w-20 h-20 opacity-30 text-blue-400" />
            </div>
            <div className="absolute top-1/2 left-[5%] animate-float" style={{ animationDelay: '3s' }}>
                <Bell className="w-10 h-10 opacity-30 text-red-400" />
            </div>
            <div className="absolute top-1/3 right-[10%] animate-float" style={{ animationDelay: '5s' }}>
                <FileText className="w-12 h-12 opacity-30 text-orange-400" />
            </div>
            {/* New Elements */}
            <div className="absolute bottom-1/4 left-[10%] animate-float" style={{ animationDelay: '2.5s' }}>
                <User className="w-10 h-10 opacity-30 text-teal-400" />
            </div>
            <div className="absolute top-1/4 left-[40%] animate-float" style={{ animationDelay: '1.5s' }}>
                <MessageCircle className="w-8 h-8 opacity-30 text-pink-500" />
            </div>
        </div>
    );
};

export default BackgroundEffects;
