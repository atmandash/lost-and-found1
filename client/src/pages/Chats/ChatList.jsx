import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const location = useLocation();

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [location]); // Re-fetch when location changes

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching chats...');
            const res = await axios.get(`${API_URL}/api/chats`, {
                headers: { 'x-auth-token': token }
            });
            console.log('Chats received:', res.data);
            console.log('Number of chats:', res.data.length);
            setChats(res.data);
        } catch (err) {
            console.error('Error fetching chats:', err);
            console.error('Error response:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={`text-center py-10 ${isDarkMode ? 'text-gray-300' : ''}`}>Loading chats...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Chats</h1>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {chats.length} active {chats.length === 1 ? 'conversation' : 'conversations'}
                </div>
            </div>

            {chats.length === 0 ? (
                <div className={`text-center py-12 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-gray-100'}`}>
                    <MessageCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-indigo-300'}`} />
                    <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No active chats</p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start helping others by browsing lost & found items!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {chats.map(chat => {
                        const lastMessage = chat.messages[chat.messages.length - 1];
                        const unreadCount = chat.unreadCount || 0;
                        const itemTitle = chat.itemId?.title || 'Unknown Item';
                        const itemLocation = chat.itemId?.location?.main || '';
                        const chatTitle = itemLocation ? `${itemTitle} - ${itemLocation}` : itemTitle;

                        return (
                            <Link
                                key={chat._id}
                                to={`/chats/${chat._id}`}
                                className={`block p-4 rounded-xl shadow-sm border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:shadow-md hover:border-indigo-600' : 'bg-white border-gray-200 hover:shadow-md hover:border-indigo-200'}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {chat.itemId?.title?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        {unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                                {chatTitle}
                                            </h3>
                                            <span className={`text-xs flex-shrink-0 ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${unreadCount > 0 ? isDarkMode ? 'font-semibold text-gray-200' : 'font-semibold text-gray-900' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {lastMessage ? lastMessage.content : 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList;
