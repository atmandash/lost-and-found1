import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ReportSelection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();

    const handleReportClick = (type) => {
        navigate(type === 'lost' ? '/report/lost' : '/report/found');
    };

    return (
        <div className="flex-grow w-full flex flex-col items-center justify-center animate-fade-in relative overflow-hidden py-12 px-4 min-h-[80vh]">

            {/* Header */}
            <div className="text-center mb-16 relative z-10 space-y-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 drop-shadow-sm">
                    Make a Report
                </h1>
                <p className={`text-xl md:text-2xl font-light ${isDarkMode ? 'text-blue-200/80' : 'text-gray-600'}`}>
                    Select the option that matches your situation
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10 px-4">
                {/* LOST Card */}
                <button
                    onClick={() => handleReportClick('lost')}
                    className="group relative h-80 flex flex-col items-center justify-center rounded-[2.5rem] border border-white/10 bg-gray-900/30 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden"
                >
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/0 group-hover:from-red-600/20 group-hover:via-orange-600/10 group-hover:to-rose-600/20 transition-all duration-500"></div>

                    {/* Glow Orb */}
                    <div className="absolute w-32 h-32 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/40 transition-all duration-500"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center space-y-6 p-8 text-center">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all duration-500">
                            <Search className="w-16 h-16 text-white/90 group-hover:text-red-400 transition-colors duration-500" strokeWidth={1.5} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl font-bold text-white tracking-wide group-hover:text-red-100 transition-colors">I Lost Something</h2>
                            <p className="text-lg text-gray-400 group-hover:text-red-200/80 font-light max-w-xs mx-auto">
                                Search for your missing item or create a frantic alert
                            </p>
                        </div>
                    </div>

                    {/* Border Glow */}
                    <div className="absolute inset-0 rounded-[2.5rem] border border-transparent group-hover:border-red-500/30 transition-colors duration-500"></div>
                </button>

                {/* FOUND Card */}
                <button
                    onClick={() => handleReportClick('found')}
                    className="group relative h-80 flex flex-col items-center justify-center rounded-[2.5rem] border border-white/10 bg-gray-900/30 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden"
                >
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-emerald-600/20 group-hover:via-green-600/10 group-hover:to-teal-600/20 transition-all duration-500"></div>

                    {/* Glow Orb */}
                    <div className="absolute w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/40 transition-all duration-500"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center space-y-6 p-8 text-center">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:bg-green-500/20 group-hover:border-green-500/30 transition-all duration-500">
                            <Heart className="w-16 h-16 text-white/90 group-hover:text-green-400 transition-colors duration-500" strokeWidth={1.5} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl font-bold text-white tracking-wide group-hover:text-green-100 transition-colors">I Found Something</h2>
                            <p className="text-lg text-gray-400 group-hover:text-green-200/80 font-light max-w-xs mx-auto">
                                Be a hero and help return a lost item to its owner
                            </p>
                        </div>
                    </div>

                    {/* Border Glow */}
                    <div className="absolute inset-0 rounded-[2.5rem] border border-transparent group-hover:border-green-500/30 transition-colors duration-500"></div>
                </button>
            </div>

            <button
                onClick={() => navigate('/')}
                className={`mt-16 flex items-center gap-2 text-sm font-medium transition-all group relative z-10 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
            </button>
        </div>
    );
};

export default ReportSelection;
