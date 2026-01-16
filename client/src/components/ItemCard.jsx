import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import MapView from './MapView';

const ItemCard = ({ item }) => {
    const isLost = item.type === 'lost';
    const { user, isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [creatingChat, setCreatingChat] = useState(false);

    // Check if this is the user's own item
    const itemUserId = item.user?._id || item.user;
    const currentUserId = user?._id || user?.id;
    const isMyItem = user && itemUserId && currentUserId && String(itemUserId) === String(currentUserId);

    const handleStartChat = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setCreatingChat(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/chats/initiate',
                { itemId: item._id },
                { headers: { 'x-auth-token': token } }
            );
            navigate(`/chats/${res.data._id}`);
        } catch (err) {
            console.error('Error creating chat:', err);
            setCreatingChat(false);
        }
    };

    const getDaysRemaining = (createdAt) => {
        const created = new Date(createdAt);
        const expires = new Date(created);
        expires.setDate(created.getDate() + 30);
        const now = new Date();
        const diffTime = expires - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining(item.createdAt);

    return (
        <div className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300 relative group hover-lift card-glow ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            {/* Type Badge */}
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white z-10 ${isLost ? 'bg-red-500' : 'bg-green-500'} animate-fade-in`}>
                {item.type}
            </div>

            {/* Status Badge - Requested by User */}
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white z-10 ${['resolved', 'closed', 'reunited'].includes(item.status) ? 'bg-emerald-600' : 'bg-amber-500'
                } animate-fade-in shadow-sm`}>
                {['resolved', 'closed', 'reunited'].includes(item.status) ? 'Resolved' : 'Pending'}
            </div>

            {/* Map Preview */}
            <div className="h-48 w-full overflow-hidden">
                <MapView coordinates={item.coordinates} title={item.title} />
            </div>

            <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {item.category}
                    </span>
                </div>

                <h3 className={`text-lg font-bold mb-1 truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.title}</h3>

                <div className="space-y-2 mt-3">
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className={`w-4 h-4 mr-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className="truncate">{item.location.main}</span>
                    </div>
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className={`w-4 h-4 mr-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Expiration Timer for Owner */}
                {isMyItem && item.status === 'active' && (
                    <div className={`mt-3 text-xs font-medium ${daysRemaining <= 5 ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Expires in: {daysRemaining} days
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3">
                    <Link
                        to={`/items/${item._id}`}
                        className={`flex-1 py-2.5 text-center rounded-xl text-sm font-bold tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md ${isLost
                            ? isDarkMode
                                ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-red-900/50 text-red-400 hover:border-red-500/50'
                                : 'bg-gradient-to-br from-white to-red-50 border border-red-100 text-red-600 hover:border-red-200'
                            : isDarkMode
                                ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-green-900/50 text-green-400 hover:border-green-500/50'
                                : 'bg-gradient-to-br from-white to-green-50 border border-green-100 text-green-600 hover:border-green-200'
                            }`}
                    >
                        View Details
                    </Link>

                    {/* Chat Button - Only show if not user's own item and item is active */}
                    {!isMyItem && item.status === 'active' && (
                        <button
                            onClick={handleStartChat}
                            disabled={creatingChat}
                            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-hover:from-violet-500 group-hover:to-indigo-500"
                        >
                            <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                            {creatingChat ? '...' : 'Chat'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemCard;

