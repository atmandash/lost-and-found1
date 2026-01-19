import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Search, MessageCircle, User, Bell, LogIn, Trophy, Sun, Moon, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import axios from 'axios'; // Added
import API_URL from '../config/api'; // Added
import { useState, useEffect } from 'react'; // Added hooks

const Navbar = () => {
    const { isAuthenticated, user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const [leaderboardVisible, setLeaderboardVisible] = useState(true); // Default to true

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/settings/leaderboardVisible`);
                if (res.data && res.data.value !== undefined) {
                    setLeaderboardVisible(res.data.value);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, [location.pathname]);

    return (
        <nav className={`fixed bottom-0 w-full md:relative z-50 bg-gray-900/90 backdrop-blur-md border-t border-white/5 ${!isAuthenticated ? 'hidden md:block' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between md:justify-start h-14 items-center">
                    {/* Logo */}
                    <Link to="/" className="hidden md:flex items-center text-2xl font-extrabold mr-10 tracking-tight">
                        <Search className="w-8 h-8 mr-3 stroke-[2.5] text-teal-500" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-500">
                            Lost&Found
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex w-full justify-around md:w-auto md:space-x-8 items-center">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/lost" icon={<MapPin className="text-red-500" />} label="Lost" />
                                <NavLink to="/found" icon={<MapPin className="text-green-600" />} label="Found" />
                                {!user?.isAdmin && (
                                    <NavLink to="/chats" icon={<MessageCircle />} label="Chats" />
                                )}
                                {(user?.isAdmin || leaderboardVisible) && (
                                    <NavLink to="/leaderboard" icon={<Trophy />} label="Leaderboard" />
                                )}
                                {user?.isAdmin && (
                                    <NavLink to="/admin/users" icon={<Users className="text-red-600" />} label="User Mgmt" />
                                )}
                                <NavLink to="/profile" icon={<User />} label="Profile" />
                                <div className="hidden md:flex items-center gap-2 ml-4">
                                    <NotificationBell />
                                </div>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" icon={<LogIn className="text-teal-500" />} label="Login" />
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
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col relative">
            <BackgroundEffects />
            {/* Top Bar for Mobile */}
            <div className="md:hidden h-14 px-4 flex justify-between items-center sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md">
                <Link to="/" className="font-extrabold text-xl flex items-center leading-none tracking-tight">
                    <Search className="w-6 h-6 mr-2 stroke-[2.5] text-teal-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-500">
                        Lost&Found
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <div className="flex-shrink-0 flex items-center">
                            <NotificationBell />
                        </div>
                    )}
                    {!isAuthenticated && (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            Login
                        </Link>
                    )}
                </div>
            </div>

            <Navbar />

            <main className={`flex-grow mx-auto py-8 ${location.pathname === '/' ? 'pb-4' : 'pb-32 md:pb-8'} flex flex-col w-full max-w-full overflow-x-hidden ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {children}
            </main>

        </div>
    );
};

export default Layout;

