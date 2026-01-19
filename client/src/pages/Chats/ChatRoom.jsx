import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Phone, CheckCircle, AlertCircle, Shield, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';
import { io } from 'socket.io-client';

const socket = io(API_URL);

const ChatRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [canResolve, setCanResolve] = useState(false);
    const [phoneStatus, setPhoneStatus] = useState({ myPhoneShared: false, theirPhoneShared: false });
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchChat();
        checkCanResolve();
        markAsRead(); // Mark read on enter

        if (id) {
            socket.emit('join_chat', id);
        }

        socket.on('receive_message', (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
            // Optional: Mark read if window is focused?
            // For now, simple implementation
        });

        // Cleanup
        return () => {
            socket.off('receive_message');
            if (id) socket.emit('leave_chat', id);
        };
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChat = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/api/chats/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setChat(res.data);
            if (res.data.messages.length !== messages.length) {
                setMessages(res.data.messages);
            }
        } catch (err) {
            console.error('Error fetching chat:', err);
            if (err.response?.status === 410) {
                setError('This chat has expired');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view this chat.');
            } else if (err.response?.status === 404) {
                setError('Chat not found.');
            } else {
                setError('Failed to load chat. Please try again.');
            }
        }
    };

    const checkCanResolve = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/api/chats/${id}/can-resolve`, {
                headers: { 'x-auth-token': token }
            });
            setCanResolve(res.data.canResolve);

            // Determine which phone is mine vs theirs
            const myId = user?.id || user?._id;
            const phoneShared = res.data.phoneShared || {};
            const keys = Object.keys(phoneShared);
            const myPhoneShared = phoneShared[myId] || false;
            const theirPhoneShared = keys.filter(k => k !== myId).some(k => phoneShared[k]);

            setPhoneStatus({ myPhoneShared, theirPhoneShared });
        } catch (err) {
            console.error('Error checking resolve status:', err);
        }
    };

    const markAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await axios.put(`${API_URL}/api/chats/${id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/chats/${id}/messages`,
                { content: newMessage },
                { headers: { 'x-auth-token': token } }
            );
            setNewMessage('');
            setNewMessage('');
            // fetchChat(); // No longer needed, socket handles it
            // Optimistic update also possible, but socket is fast enough
        } catch (err) {
            console.error('Error sending message:', err);
            if (err.response?.status === 400) {
                setError(err.response.data.message || 'Please be respectful. Profanity is not allowed.');
                setTimeout(() => setError(''), 5000);
            }
        }
    };

    const handleSharePhone = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/chats/${id}/share-phone`, {}, {
                headers: { 'x-auth-token': token }
            });
            setSuccess('Phone number shared! +10 points');
            setTimeout(() => setSuccess(''), 3000);
            fetchChat();
            checkCanResolve();
        } catch (err) {
            console.error('Error sharing phone:', err);
            setError(err.response?.data?.message || 'Failed to share phone number');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleResolve = async () => {
        if (!canResolve) {
            setError('Both parties must share their contact numbers before resolving');
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (!window.confirm('🎉 Mark as resolved?\n\nThis will:\n• Remove the item from active listings\n• Award +50 points to the finder\n• Mark the chat as resolved\n\nThis action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/chats/${id}/resolve`, {}, {
                headers: { 'x-auth-token': token }
            });
            setSuccess(`${res.data.message} +${res.data.pointsAwarded} points!`);
            setTimeout(() => navigate('/chats'), 2000);
        } catch (err) {
            console.error('Error resolving chat:', err);
            setError(err.response?.data?.message || 'Failed to resolve chat');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Error State (e.g., 403 Forbidden)
    if (error && !chat) {
        return (
            <div className={`max-w-3xl mx-auto px-4 py-8 text-center rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Unable to Load Chat</h2>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                <button
                    onClick={() => navigate('/chats')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Back to All Chats
                </button>
            </div>
        );
    }

    if (!chat) return <div className={`text-center py-10 ${isDarkMode ? 'text-gray-300' : ''}`}>Loading chat...</div>;

    return (
        <div className={`max-w-3xl mx-auto px-4 h-[80vh] flex flex-col rounded-xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            {/* Header */}
            <div className={`p-4 border-b flex flex-col gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-gray-100'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {chat.itemId?.location?.main
                                ? `${chat.itemId.title} - ${chat.itemId.location.main}`
                                : chat.itemId?.title || 'Chat'
                            }
                        </h2>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Anonymous Chat • End-to-End Query</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSharePhone}
                            disabled={phoneStatus.myPhoneShared}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${phoneStatus.myPhoneShared
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            <Phone className="w-4 h-4" />
                            {phoneStatus.myPhoneShared ? 'Shared ✓' : 'Share Contact'}
                        </button>
                        {canResolve && (
                            <button
                                onClick={handleResolve}
                                className="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                                title="Mark as resolved"
                            >
                                <Unlock className="w-4 h-4" />
                                Resolve
                            </button>
                        )}
                    </div>
                </div>

                {/* Phone sharing status indicator */}
                <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`flex items-center gap-1 ${phoneStatus.myPhoneShared ? 'text-green-600' : ''}`}>
                        {phoneStatus.myPhoneShared ? <CheckCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        You: {phoneStatus.myPhoneShared ? 'Shared' : 'Not shared'}
                    </div>
                    <div className={`flex items-center gap-1 ${phoneStatus.theirPhoneShared ? 'text-green-600' : ''}`}>
                        {phoneStatus.theirPhoneShared ? <CheckCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        Other party: {phoneStatus.theirPhoneShared ? 'Shared' : 'Not shared'}
                    </div>
                </div>

                {/* Resolve button notice */}
                {!canResolve && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isDarkMode ? 'bg-yellow-900/40 border border-yellow-700 text-yellow-200' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'}`}>
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>
                            <strong>Resolve button locked:</strong> Both you and the other party must share your contact numbers before the issue can be marked as resolved. This ensures both parties have a way to coordinate the item handover.
                        </span>
                    </div>
                )}
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            {success && (
                <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {success}
                </div>
            )}

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`border px-4 py-2 rounded-lg text-sm text-center mb-4 ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                    🙏 Please be respectful. Profanity and hurtful language are strictly prohibited.
                </div>
                {messages.map((msg, idx) => {
                    // Robust check for "Me"
                    // Handle both populated object and string ID
                    const msgSenderId = msg.sender._id || msg.sender;
                    const myId = user.id || user._id;
                    const isMe = msgSenderId.toString() === myId.toString();

                    const isPhoneShare = msg.isPhoneShare;
                    const senderName = isMe ? 'Me' : 'Anonymous';

                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 items-end`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex-shrink-0 mr-2 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                                    {senderName[0]}
                                </div>
                            )}

                            <div className="flex flex-col max-w-[70%]">
                                <div
                                    className={`px-5 py-3 rounded-2xl text-sm shadow-sm ${isPhoneShare
                                        ? 'bg-green-100 border border-green-300 text-green-800'
                                        : isMe
                                            ? 'bg-indigo-600 text-white rounded-br-none' // My message: Solid Blue/Purple
                                            : isDarkMode
                                                ? 'bg-gray-700 text-gray-100 rounded-bl-none border border-gray-600' // Theirs (Dark): Gray
                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200' // Theirs (Light): White
                                        }`}
                                >
                                    <p className="break-words leading-relaxed">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isPhoneShare
                                        ? 'text-green-700'
                                        : isMe
                                            ? 'text-indigo-200'
                                            : isDarkMode
                                                ? 'text-gray-400'
                                                : 'text-gray-400'
                                        }`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className={`p-4 border-t flex items-center space-x-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <input
                    type="text"
                    className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-200'}`}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;

