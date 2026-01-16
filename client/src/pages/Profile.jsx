import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, CheckCircle, MapPin, Calendar, TrendingUp, Phone, Shield, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ItemCard from '../components/ItemCard';
import { useCountAnimation } from '../hooks/useCountAnimation';

// Avatar generation function based on user ID
const generateAvatar = (userId, name) => {
    // Use DiceBear API for consistent avatars
    const styles = ['adventurer', 'avataaars', 'bottts', 'micah', 'personas'];
    const styleIndex = parseInt(userId?.slice(-1) || '0', 16) % styles.length;
    const style = styles[styleIndex];

    return `https://api.dicebear.com/7.x/${style}/svg?seed=${userId || name}`;
};

const Profile = () => {
    const { user, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        lost: 0,
        found: 0,
        points: 0,
        level: 1,
        totalReports: 0
    });

    useEffect(() => {
        if (user) {
            fetchMyItems();

            // Poll for updates every 10 seconds (only when tab is visible)
            const interval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    fetchMyItems();
                }
            }, 10000);

            // Refresh when window gains focus
            const handleFocus = () => {
                fetchMyItems();
            };

            window.addEventListener('focus', handleFocus);

            return () => {
                clearInterval(interval);
                window.removeEventListener('focus', handleFocus);
            };
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchMyItems = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Handle potential ID mismatch (user.id vs user._id)
            const userId = user.id || user._id;

            console.log('Fetching items for User:', userId);

            // Fetch user gamification stats
            const statsRes = await axios.get('http://localhost:5000/api/gamification/stats', {
                headers: { 'x-auth-token': token }
            });

            // Fetch ONLY this user's items using backend filter
            // This is safer than fetching all and filtering on client
            const lostRes = await axios.get(`http://localhost:5000/api/items?type=lost&user=${userId}`, {
                headers: { 'x-auth-token': token }
            });
            const foundRes = await axios.get(`http://localhost:5000/api/items?type=found&user=${userId}`, {
                headers: { 'x-auth-token': token }
            });

            console.log('Lost items fetched:', lostRes.data.length);
            console.log('Found items fetched:', foundRes.data.length);

            // Additional client-side check to be absolutely sure
            const myLostItems = lostRes.data.filter(item => {
                const itemUserId = item.user?._id || item.user;
                return String(itemUserId) === String(userId);
            });

            const myFoundItems = foundRes.data.filter(item => {
                const itemUserId = item.user?._id || item.user;
                return String(itemUserId) === String(userId);
            });

            const allMyItems = [...myLostItems, ...myFoundItems];
            setMyItems(allMyItems);

            // Update stats with data from API + local calculation for redundancy
            setStats({
                lost: myLostItems.length,
                found: myFoundItems.length,
                points: statsRes.data.points || 0,
                level: statsRes.data.level || 1,
                totalReports: allMyItems.length
            });

        } catch (err) {
            console.error('Profile: Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-center py-10">Please login</div>;

    const avatarUrl = generateAvatar(user.id, user.name);

    // Animated counts for smooth transitions
    const animatedTotalReports = useCountAnimation(stats.lost + stats.found, 1000);
    const animatedLostItems = useCountAnimation(stats.lost, 1000);
    const animatedFoundItems = useCountAnimation(stats.found, 1000);
    const animatedKarmaPoints = useCountAnimation(stats.points || 0, 1200);

    const [activeTab, setActiveTab] = useState('active');

    // Handle tab query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['active', 'history'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    // Filter items based on tab
    const filteredItems = myItems.filter(item => {
        if (activeTab === 'active') {
            return !['resolved', 'closed'].includes(item.status);
        } else if (activeTab === 'history') {
            return ['resolved', 'closed'].includes(item.status);
        }
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Header with Gradient */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-xl text-white animate-fade-in-scale">
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-4 md:space-y-0 md:space-x-8">
                    {/* Random Avatar */}
                    <div className="w-32 h-32 bg-white rounded-full shadow-2xl border-4 border-white overflow-hidden animate-fade-in">
                        <img
                            src={avatarUrl}
                            alt={`${user.name}'s avatar`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold animate-slide-in-right">{user.name}</h1>
                        <p className="text-indigo-100 mt-1 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>{user.email}</p>

                        {/* Phone Number and Verified Badge in White Spaces */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                            {/* Phone Number - First White Space */}
                            <div className="bg-white text-indigo-900 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 min-w-[200px] hover-lift">
                                <Phone className="w-5 h-5 text-indigo-600" />
                                <span className="font-semibold">{user.phone || 'No phone'}</span>
                            </div>

                            {/* Verified Student - Second White Space */}
                            <div className="bg-white text-green-700 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 min-w-[200px] hover-lift">
                                <Shield className="w-5 h-5 text-green-600" />
                                <span className="font-semibold">Verified VIT Student</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-lg hover-scale"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Grid with Gradients and Animated Counts */}
            <div className="w-full mb-6">
                {/* Live Indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-Time Stats</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-stagger">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white hover-lift card-glow transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold tabular-nums">{animatedTotalReports}</div>
                            <div className="text-sm text-indigo-100 mt-1">Total Reports</div>
                        </div>
                        <MapPin className="w-10 h-10 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white hover-lift card-glow transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold tabular-nums">{animatedLostItems}</div>
                            <div className="text-sm text-red-100 mt-1">Lost Items</div>
                        </div>
                        <MapPin className="w-10 h-10 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white hover-lift card-glow transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold tabular-nums">{animatedFoundItems}</div>
                            <div className="text-sm text-green-100 mt-1">Found Items</div>
                        </div>
                        <MapPin className="w-10 h-10 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-lg text-white hover-lift card-glow transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold tabular-nums flex items-center gap-2">
                                {animatedKarmaPoints}
                                <Activity className="w-6 h-6 text-yellow-200 animate-pulse" />
                            </div>
                            <div className="text-sm text-yellow-100 mt-1">Karma Points (Lvl {stats.level || 1})</div>
                        </div>
                        <TrendingUp className="w-10 h-10 opacity-50" />
                    </div>
                </div>
            </div>

            {/* My Reports Section with Tabs */}
            <div className={`p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Reports</h2>

                    <div className="flex items-center gap-4">
                        {/* Tabs */}
                        <div className={`flex p-1 rounded-xl w-full sm:w-auto overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'active'
                                    ? 'bg-white text-indigo-600 shadow-md'
                                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                    }`}
                            >
                                Active Reports
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history'
                                    ? 'bg-white text-indigo-600 shadow-md'
                                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                    }`}
                            >
                                History
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>
                ) : filteredItems.length === 0 ? (
                    <div className={`text-center py-12 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                        <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                        <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {activeTab === 'active' ? 'No active reports' : 'No history yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <ItemCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
