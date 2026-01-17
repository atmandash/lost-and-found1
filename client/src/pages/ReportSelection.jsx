import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ReportSelection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();

    const handleReportClick = (type) => {
        navigate(`/${type}`);
    };

    return (
        <div className="px-4 flex-grow w-full flex flex-col items-center justify-center animate-fade-in relative overflow-hidden py-4">
            {/* Geometric Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large circle - top right */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                {/* Medium circle - bottom left */}
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-2xl" style={{ animation: 'glowPulse 6s ease-in-out infinite' }}></div>
                {/* Small accent circle - center */}
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-xl" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
            </div>

            {/* Login Button - Hidden on mobile to avoid overlap with navbar */}
            {!isAuthenticated && (
                <div className="absolute top-6 right-6 z-50 hidden md:block">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 hover:scale-105"
                    >
                        Login
                    </button>
                </div>
            )}

            <h1 className={`text-3xl md:text-4xl font-bold mb-12 text-center relative z-10 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                What incident would you like to report?
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
                {/* LOST Button */}
                <button
                    onClick={() => handleReportClick('lost')}
                    className="group relative p-8 h-64 flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-orange-600 text-white rounded-3xl shadow-2xl hover:shadow-red-500/50 transform hover:scale-[1.03] active:scale-95 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <Search className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform relative z-10 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold relative z-10">I LOST SOMETHING</h2>
                    <p className="mt-2 text-red-100 opacity-90 relative z-10">Report a lost item to the community</p>
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </button>

                {/* FOUND Button */}
                <button
                    onClick={() => handleReportClick('found')}
                    className="group relative p-8 h-64 flex flex-col items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white rounded-3xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-[1.03] active:scale-95 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <Heart className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform relative z-10 drop-shadow-lg" />
                    <h2 className="text-3xl font-bold relative z-10">I FOUND SOMETHING</h2>
                    <p className="mt-2 text-green-100 opacity-90 relative z-10">Help return an item to its owner</p>
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </button>
            </div>

            <button
                onClick={() => navigate('/')}
                className={`mt-12 text-sm font-medium hover:underline relative z-10 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
                ← Back to Home
            </button>
        </div>
    );
};

export default ReportSelection;
