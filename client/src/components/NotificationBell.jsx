import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const { isAuthenticated } = useAuth();
    const dropdownRef = useRef(null);
    const isMounted = useRef(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            fetchUnreadCount();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                if (isMounted.current) {
                    fetchUnreadCount();
                }
            }, 30000);

            return () => {
                isMounted.current = false;
                clearInterval(interval);
            };
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { 'x-auth-token': token }
            });
            if (isMounted.current) {
                setNotifications(res.data.slice(0, 5)); // Show only 5 most recent
            }
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error('Error fetching notifications:', err);
            }
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
                headers: { 'x-auth-token': token }
            });
            if (isMounted.current) {
                setUnreadCount(res.data.count);
            }
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error('Error fetching unread count:', err);
            }
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            const token = localStorage.getItem('token');

            // Mark as read
            if (!notification.read) {
                await axios.put(`${API_URL}/api/notifications/${notification._id}/read`, {}, {
                    headers: { 'x-auth-token': token }
                });
                fetchUnreadCount();
            }

            // Navigate to item
            if (notification.type === 'match' && notification.matchedItemId) {
                navigate(`/items/${notification.matchedItemId._id || notification.matchedItemId}`);
            } else if (notification.itemId) {
                navigate(`/items/${notification.itemId._id || notification.itemId}`);
            }

            setShowDropdown(false);
        } catch (err) {
            console.error('Error handling notification:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/notifications/mark-all-read`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchNotifications();
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setShowDropdown(!showDropdown);
                    if (!showDropdown) fetchNotifications();
                }}
                className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'bell-ring' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-teal-900/50 to-cyan-900/50">
                        <h3 className="font-bold text-gray-100">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                // Extract item type and title from message if available
                                const isClaimNotification = notification.type === 'claim';
                                const itemType = notification.itemId?.type;

                                return (
                                    <div
                                        key={notification._id}
                                        className={`p-3 border-b border-gray-700 transition-colors ${!notification.read ? 'bg-teal-900/30' : ''
                                            }`}
                                    >
                                        <div
                                            onClick={() => handleNotificationClick(notification)}
                                            className="hover:bg-gray-700 cursor-pointer rounded p-2"
                                        >
                                            <div className="flex items-start gap-2">
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm text-gray-200 leading-snug">
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                                            {new Date(notification.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add Chat button for claim/match notifications */}
                                        {(notification.type === 'claim' || notification.type === 'match') && (
                                            <div className="mt-2 pl-4 flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const targetId = notification.type === 'match'
                                                            ? (notification.matchedItemId?._id || notification.matchedItemId)
                                                            : (notification.itemId?._id || notification.itemId);

                                                        if (targetId) {
                                                            navigate(`/items/${targetId}`);
                                                            setShowDropdown(false);
                                                        }
                                                    }}
                                                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm flex items-center"
                                                >
                                                    View Item
                                                </button>

                                                {/* Start Chat button for Claims */}
                                                {notification.type === 'claim' && notification.relatedUser && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                // Provide visual feedback
                                                                e.target.innerText = 'Starting...';

                                                                const res = await axios.post(`${API_URL}/api/chats/initiate`, {
                                                                    itemId: notification.itemId?._id || notification.itemId,
                                                                    recipientId: notification.relatedUser
                                                                }, {
                                                                    headers: { 'x-auth-token': token }
                                                                });

                                                                // Mark as read
                                                                if (!notification.read) {
                                                                    await axios.put(`${API_URL}/api/notifications/${notification._id}/read`, {}, {
                                                                        headers: { 'x-auth-token': token }
                                                                    });
                                                                    fetchUnreadCount();
                                                                }

                                                                setShowDropdown(false);
                                                                navigate(`/chats/${res.data._id}`);
                                                            } catch (err) {
                                                                console.error('Error starting chat:', err);
                                                                e.target.innerText = 'Error';
                                                            }
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                                                    >
                                                        Start Chat with User
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
