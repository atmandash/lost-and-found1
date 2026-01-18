import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Activity, Bell, Shield, MessageCircle, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import API_URL from '../config/api';
import Footer from '../components/Footer';
import SpotlightCard from '../components/SpotlightCard';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const [stats, setStats] = useState({
        totalReports: 0,
        lostItems: 0,
        foundItems: 0,
        itemsReturned: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch global stats
    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/stats/global`);
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') fetchStats();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: <MapPin className="w-6 h-6 text-yellow-500" />,
            title: "Easy Reporting",
            desc: "Report items in seconds with our intuitive interface."
        },
        {
            icon: <Bell className="w-6 h-6 text-red-500" />,
            title: "Instant Alerts",
            desc: "Create a watchlist and get notified the moment your item is found."
        },
        {
            icon: <Shield className="w-6 h-6 text-green-500" />,
            title: "Verified Community",
            desc: "Only verified student IDs can post, ensuring a safe environment."
        },
        {
            icon: <MessageCircle className="w-6 h-6 text-indigo-500" />,
            title: "Secure Chat",
            desc: "Coordinate returns safely without sharing personal phone numbers. Phone numbers only get shared when you agree to."
        }
    ];

    // Static Display (Animation Removed)
    const CountUp = ({ end }) => <span>{end}</span>;



    return (
        <div className="relative flex flex-col items-center flex-1 justify-between overflow-hidden pb-0 w-full min-h-full">
            {/* Background handled globaly by BackgroundEffects */}

            {/* HERO SECTION - Enhanced with z-index */}
            <div className="flex flex-col items-center justify-center text-center mt-12 px-4 max-w-4xl space-y-8 animate-fade-in-scale relative z-10">
                <div className="space-y-4">
                    <h1
                        className={`text-5xl md:text-7xl font-extrabold tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        style={{ textShadow: isDarkMode ? '0 0 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(168, 85, 247, 0.2)' : 'none' }}
                    >
                        Find What You've <br />
                        <span
                            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 animate-gradient-x"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.3))' }}
                        >Lost on Campus.</span>
                    </h1>
                    <p
                        className={`text-xl md:text-2xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        style={{ textShadow: isDarkMode ? '0 0 30px rgba(148, 163, 184, 0.3)' : 'none' }}
                    >
                        Don't panic. Connect with the community to recover your belongings instantly. Safe, fast, and simple.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/start')}
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-lg font-bold rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2 animate-bounce-slow"
                >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    {/* Button glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity -z-10"></div>
                </button>
            </div>

            {/* FEATURES GRID - With Spotlight Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl w-full mt-24 relative z-10 animate-stagger">
                {features.map((feature, idx) => (
                    <SpotlightCard key={idx} className="p-6 flex flex-col items-center text-center h-full">
                        <div className="mb-4 bg-gray-800/60 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-white/5">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                    </SpotlightCard>
                ))}
            </div>

            {/* STATS FOOTER (Original Grid Design Restored) */}
            <div className="w-full max-w-5xl mt-24 relative z-10 px-4 animate-slide-in-up mb-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm font-bold tracking-wide uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Live Platform Stats</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center">
                    <div className={`stagger-item text-center p-4 rounded-xl shadow-sm hover-lift transition-all w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="text-2xl md:text-3xl font-bold text-indigo-600 transition-all">
                            {loading ? '...' : <CountUp end={stats.totalReports} />}
                        </div>
                        <div className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Reports</div>
                    </div>
                    <div className={`stagger-item text-center p-4 rounded-xl shadow-sm hover-lift transition-all w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="text-2xl md:text-3xl font-bold text-red-600 transition-all">
                            {loading ? '...' : <CountUp end={stats.lostItems} />}
                        </div>
                        <div className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lost Items</div>
                    </div>
                    <div className={`stagger-item text-center p-4 rounded-xl shadow-sm hover-lift transition-all w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="text-2xl md:text-3xl font-bold text-green-600 transition-all">
                            {loading ? '...' : <CountUp end={stats.foundItems} />}
                        </div>
                        <div className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Found Items</div>
                    </div>
                    <div className={`stagger-item text-center p-4 rounded-xl shadow-sm hover-lift transition-all w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="text-2xl md:text-3xl font-bold text-yellow-600 transition-all flex items-center justify-center gap-1">
                            {loading ? '...' : <CountUp end={stats.activeUsers} />}
                            <Activity className="w-4 h-4 text-green-500 pulse" />
                        </div>
                        <div className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LandingPage;
