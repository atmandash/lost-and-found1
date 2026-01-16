import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Search, MessageCircle, User, Bell, LogIn, Trophy, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();

    return (
        <nav className={`fixed bottom-0 w-full border-t md:relative md:border-t-0 md:shadow-sm z-50 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between md:justify-start h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="hidden md:flex items-center text-xl font-bold text-indigo-600 mr-10">
                        <Search className="w-6 h-6 mr-2" />
                        Lost&Found
                    </Link>

                    {/* Nav Links */}
                    <div className="flex w-full justify-around md:w-auto md:space-x-8 items-center">
                        {isAuthenticated && (
                            <>
                                <NavLink to="/lost" icon={<MapPin className="text-red-500" />} label="Lost" />
                                <NavLink to="/found" icon={<MapPin className="text-green-600" />} label="Found" />
                                <NavLink to="/chats" icon={<MessageCircle />} label="Chats" />
                                <NavLink to="/leaderboard" icon={<Trophy />} label="Leaderboard" />
                                <NavLink to="/profile" icon={<User />} label="Profile" />
                                <div className="hidden md:flex items-center gap-2 ml-4">
                                    <NotificationBell />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => {
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center w-full py-2 md:py-0 md:flex-row md:space-x-1
        ${isActive ? 'text-indigo-600' : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-900'}
      `}
        >
            <div className="w-6 h-6">{icon}</div>
            <span className="text-xs md:text-sm font-medium">{label}</span>
        </Link>
    );
};

import Footer from './Footer';
import BackgroundEffects from './BackgroundEffects';

const Layout = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 relative`}>
            <BackgroundEffects />
            {/* Top Bar for Mobile */}
            <div className={`md:hidden p-4 shadow-sm flex justify-between items-center sticky top-0 z-40 ${isDarkMode ? 'bg-gray-800/90 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'}`}>
                <Link to="/" className="font-bold text-lg gradient-text flex items-center leading-none">Lost&Found</Link>
                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <div className="flex-shrink-0 flex items-center">
                            <NotificationBell />
                        </div>
                    )}
                </div>
            </div>

            <Navbar />

            <main className={`flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8 flex flex-col ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {children}
            </main>

        </div>
    );
};

export default Layout;

