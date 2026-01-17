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
            {/* Login Button */}
            {!isAuthenticated && (
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-white/80 backdrop-blur-md text-indigo-600 font-bold border border-indigo-100 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        Login
                    </button>
                </div>
            )}

            <h1 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                What incident would you like to report?
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* LOST Button */}
                <button
                    onClick={() => handleReportClick('lost')}
                    className="group relative p-8 h-64 flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <Search className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform" />
                    <h2 className="text-3xl font-bold">I LOST SOMETHING</h2>
                    <p className="mt-2 text-red-100 opacity-90">Report a lost item to the community</p>
                </button>

                {/* FOUND Button */}
                <button
                    onClick={() => handleReportClick('found')}
                    className="group relative p-8 h-64 flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <Heart className="w-20 h-20 mb-6 group-hover:scale-110 transition-transform" />
                    <h2 className="text-3xl font-bold">I FOUND SOMETHING</h2>
                    <p className="mt-2 text-green-100 opacity-90">Help return an item to its owner</p>
                </button>
            </div>

            <button
                onClick={() => navigate('/')}
                className={`mt-12 text-sm font-medium hover:underline ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
                &larr; Back to Home
            </button>
        </div>
    );
};

export default ReportSelection;
