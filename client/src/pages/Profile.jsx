import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, CheckCircle, MapPin, Calendar, TrendingUp, Phone, Shield, Activity, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config/api';
import ItemCard from '../components/ItemCard';
import { useCountAnimation } from '../hooks/useCountAnimation';

// Avatar generation function
const generateAvatar = (userId, name) => {
    // Strictly young, premium styles
    const styles = ['micah', 'lorelei', 'notionists'];
    const styleIndex = parseInt(userId?.slice(-1) || '0', 16) % styles.length;
    const style = styles[styleIndex];
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${userId || name}`;
};

// Predefined avatar styles for selection
const AVATAR_STYLES = [
    'micah',
    'lorelei',
    'notionists'
];

// Generate 12 variants for each style = 36 options
const PRESET_AVATARS = AVATAR_STYLES.flatMap(style =>
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => `https://api.dicebear.com/7.x/${style}/svg?seed=${style}_student_${i}`)
);

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
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const isMounted = useRef(true); // Track if component is mounted
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || generateAvatar(user?.id, user?.name));

    useEffect(() => {
        if (user) {
            setAvatarUrl(user.avatar || generateAvatar(user.id, user.name));
            fetchMyItems();

            // Poll for updates every 10 seconds (only when tab is visible)
            const interval = setInterval(() => {
                if (document.visibilityState === 'visible' && isMounted.current) {
                    fetchMyItems();
                }
            }, 10000);

            // Refresh when window gains focus
            const handleFocus = () => {
                if (isMounted.current) {
                    fetchMyItems();
                }
            };

            window.addEventListener('focus', handleFocus);

            return () => {
                isMounted.current = false; // Mark as unmounted
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
            const statsRes = await axios.get(`${API_URL}/api/gamification/stats`, {
                headers: { 'x-auth-token': token }
            });

            // Fetch ONLY this user's items using backend filter
            // This is safer than fetching all and filtering on client
            const lostRes = await axios.get(`${API_URL}/api/items?type=lost&user=${userId}`, {
                headers: { 'x-auth-token': token }
            });
            const foundRes = await axios.get(`${API_URL}/api/items?type=found&user=${userId}`, {
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

            if (isMounted.current) {
                setMyItems(allMyItems);

                // Update stats with data from API + local calculation for redundancy
                setStats({
                    lost: myLostItems.length,
                    found: myFoundItems.length,
                    points: statsRes.data.points || 0,
                    level: statsRes.data.level || 1,
                    totalReports: allMyItems.length
                });
            }

        } catch (err) {
            console.error('Profile: Error fetching user data:', err);
            // Only show error if not a 401 (user might be logging out)
            if (err.response?.status !== 401) {
                console.error('Failed to load your items');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    if (!user) return <div className="text-center py-10">Please login</div>;

    const handleAvatarUpdate = async (newAvatarUrl) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/auth/avatar`,
                { avatar: newAvatarUrl },
                { headers: { 'x-auth-token': token } }
            );

            // Force reload user to get new avatar update
            // We can optimistic update but reloading user context is safer
            // Or trigger a user reload via context if exposed, but page reload works too for deep sync
            window.location.reload();
        } catch (err) {
            console.error('Failed to update avatar:', err);
            alert('Failed to update avatar. Please try again.');
        } finally {
            setShowAvatarModal(false);
        }
    };

    // Animated counts for smooth transitions
    const animatedTotalReports = useCountAnimation(stats.lost + stats.found, 1000);
    const animatedLostItems = useCountAnimation(stats.lost, 1000);
    const animatedFoundItems = useCountAnimation(stats.found, 1000);
    const animatedKarmaPoints = useCountAnimation(stats.points || 0, 1200);

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
        <div className="max-w-7xl mx-auto px-4 space-y-8">
            {/* Profile Header with Gradient */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-3xl shadow-xl text-white animate-fade-in-scale">
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                    {/* Editable Avatar */}
                    <div
                        className="relative w-32 h-32 group cursor-pointer flex-shrink-0"
                        onClick={() => setShowAvatarModal(true)}
                    >
                        <div className="w-full h-full bg-white rounded-full shadow-2xl border-4 border-white overflow-hidden animate-fade-in relative z-10">
                            <img
                                src={avatarUrl}
                                alt={`${user.name}'s avatar`}
                                className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                            />
                        </div>

                        {/* Edit Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                            Change Avatar
                        </div>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold animate-slide-in-right">{user.name}</h1>
                        <p className="text-indigo-100 mt-1 animate-slide-in-right break-all" style={{ animationDelay: '0.1s' }}>{user.email}</p>

                        {/* Phone Number and Verified Badge - Hidden for Admins */}
                        {!user.isAdmin && (
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
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-lg hover-scale flex-shrink-0"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Grid with Gradients and Animated Counts */}
            < div className="w-full mb-6" >
                {/* Live Indicator */}
                < div className="flex items-center justify-center gap-2 mb-4" >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-Time Stats</span>
                </div >
            </div >

            {!user.isAdmin && (
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
            )}

            {/* Admin Dashboard OR My Reports Section */}
            {user.isAdmin ? (
                // Admin Dashboard
                <div className="space-y-6">
                    {/* Admin Dashboard Header */}
                    <div className={`p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Admin Dashboard</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System overview and management tools</p>
                    </div>

                    {/* System Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Total Users */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white hover-lift transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">-</div>
                                    <div className="text-sm text-blue-100 mt-1">Total Users</div>
                                </div>
                                <User className="w-10 h-10 opacity-50" />
                            </div>
                        </div>

                        {/* Total Items */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white hover-lift transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">-</div>
                                    <div className="text-sm text-purple-100 mt-1">Total Items</div>
                                </div>
                                <MapPin className="w-10 h-10 opacity-50" />
                            </div>
                        </div>

                        {/* Active Items */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white hover-lift transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">-</div>
                                    <div className="text-sm text-green-100 mt-1">Active Items</div>
                                </div>
                                <CheckCircle className="w-10 h-10 opacity-50" />
                            </div>
                        </div>

                        {/* Resolved Items */}
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white hover-lift transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">-</div>
                                    <div className="text-sm text-indigo-100 mt-1">Resolved Items</div>
                                </div>
                                <Award className="w-10 h-10 opacity-50" />
                            </div>
                        </div>

                        {/* Total Chats */}
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white hover-lift transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">-</div>
                                    <div className="text-sm text-pink-100 mt-1">Total Chats</div>
                                </div>
                                <MessageCircle className="w-10 h-10 opacity-50" />
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-lg text-white hover-lift transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">-%</div>
                                    <div className="text-sm text-yellow-100 mt-1">Success Rate</div>
                                </div>
                                <TrendingUp className="w-10 h-10 opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                User Management
                            </button>
                            <button
                                onClick={() => navigate('/admin/items')}
                                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                View All Items
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Regular User My Reports Section
                <div className={`p-4 sm:p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Reports</h2>

                        {/* Tabs */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className={`flex p-1 rounded-xl w-full sm:w-auto overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'active'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : `${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`
                                        }`}
                                >
                                    Active Reports
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : `${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`
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
            )}

            {/* Avatar Selection Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-600">
                            <h3 className="text-xl font-bold text-white">Choose Your Avatar</h3>
                            <button
                                onClick={() => setShowAvatarModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {/* Current Avatar Option */}
                                <div
                                    onClick={() => handleAvatarUpdate(generateAvatar(user.id, user.name))}
                                    className="aspect-square rounded-xl cursor-pointer hover:ring-4 hover:ring-indigo-500 hover:scale-105 transition-all bg-white shadow-sm flex items-center justify-center relative overflow-hidden group"
                                >
                                    <img src={generateAvatar(user.id, user.name)} alt="Default" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold">Default</span>
                                    </div>
                                </div>

                                {/* Preset Options */}
                                {PRESET_AVATARS.map((url, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleAvatarUpdate(url)}
                                        className={`aspect-square rounded-xl cursor-pointer hover:ring-4 hover:ring-indigo-500 hover:scale-105 transition-all bg-white shadow-sm overflow-hidden ${user.avatar === url ? 'ring-4 ring-green-500' : ''}`}
                                    >
                                        <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500">
                            Click on any avatar to select it instantly
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
