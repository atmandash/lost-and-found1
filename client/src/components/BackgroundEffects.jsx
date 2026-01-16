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

    // Mouse Parallax Logic (Throttled for performance)
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        let throttleTimer;
        const handleMouseMove = (e) => {
            if (throttleTimer) return; // Skip if throttle is active

            throttleTimer = setTimeout(() => {
                // Calculate position relative to center of screen (values -1 to 1)
                const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
                const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
                setMousePosition({ x, y });
                throttleTimer = null;
            }, 50); // Update at most every 50ms (20fps, smooth enough for parallax)
        };

        if (showBlobs) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [showBlobs]);

    return (
        <div key={location.pathname} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none h-full w-full">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>

            {/* Blobs - Only visible on specific pages */}
            {showBlobs && (
                <>
                    <div
                        className="absolute top-0 -left-10 w-[300px] h-[300px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
                        style={{ transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)` }}
                    ></div>
                    <div
                        className="absolute top-0 -right-10 w-[300px] h-[300px] bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
                        style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}
                    ></div>
                    <div
                        className="absolute -bottom-10 left-20 w-[300px] h-[300px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
                        style={{ transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)` }}
                    ></div>
                </>
            )}

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
