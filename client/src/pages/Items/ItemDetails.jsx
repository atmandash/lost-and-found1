import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Tag, Shield, MessageCircle, Share2, CheckCircle, ThumbsUp, ThumbsDown, Award, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';
import MapView from '../../components/MapView';
import ClaimModal from '../../components/ClaimModal';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingChat, setCreatingChat] = useState(false);
    const [voting, setVoting] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/items/${id}`);
            setItem(res.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = async () => {
        if (!isAuthenticated) {
            alert('Please login to start a chat');
            return navigate('/login');
        }

        setCreatingChat(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Initiating chat for item:', item._id);

            const res = await axios.post(`${API_URL}/api/chats/initiate`,
                { itemId: item._id },
                { headers: { 'x-auth-token': token } }
            );

            console.log('Chat created:', res.data);
            navigate(`/chats/${res.data._id}`);
        } catch (err) {
            console.error('Error creating chat:', err);
            console.error('Error response:', err.response?.data);

            // Show user-friendly error message
            const errorMsg = err.response?.data?.message || 'Failed to start chat. Please try again.';
            alert(errorMsg);
        } finally {
            setCreatingChat(false);
        }
    };

    const handleVote = async (voteType) => {
        if (!isAuthenticated) return navigate('/login');
        setVoting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/api/items/${id}/${voteType}`,
                {},
                { headers: { 'x-auth-token': token } }
            );
            // Update item with new vote counts
            setItem(prev => ({
                ...prev,
                upvotes: Array(res.data.upvotes).fill(null),
                downvotes: Array(res.data.downvotes).fill(null)
            }));
        } catch (err) {
            console.error('Error voting:', err);
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading details...</div>;
    if (!item) return <div className="text-center py-20">Item not found</div>;

    const itemUserId = item.user?._id || item.user;
    const currentUserId = user?._id || user?.id;
    const isMyItem = user && itemUserId && currentUserId && String(itemUserId) === String(currentUserId);

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Map View (Replaces Image Gallery) */}
            <div className="relative">
                <MapView
                    coordinates={item.coordinates}
                    title={item.title}
                    interactive={true}
                    className="h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200"
                />

                <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-bold text-white uppercase tracking-wide z-10 shadow-md
            ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}
          `}>
                    {item.type}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.title}</h1>
                        <div className={`flex items-center space-x-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {item.location.main}</span>
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className={`flex items-center px-2 py-0.5 rounded text-xs capitalize ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                <Tag className="w-3 h-3 mr-1" /> {item.category}
                            </span>
                        </div>

                        {/* Expiration Timer for Owner */}
                        {isMyItem && item.status === 'active' && (() => {
                            const created = new Date(item.createdAt);
                            const expires = new Date(created);
                            expires.setDate(created.getDate() + 30);
                            const now = new Date();
                            const diffTime = expires - now;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            return (
                                <div className={`mt-4 text-sm font-medium flex items-center ${diffDays <= 5 ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Activity className="w-4 h-4 mr-2" />
                                    Expires in: {diffDays} days
                                </div>
                            );
                        })()}
                    </div>

                    <div className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Description</h3>
                        <p>{item.description || 'No description provided.'}</p>

                        {item.location.details && (
                            <div className={`mt-4 p-4 rounded-lg border text-sm ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-100 text-yellow-800'}`}>
                                <strong>Specific Location:</strong> {item.location.details}
                            </div>
                        )}
                    </div>

                    {/* Owner's Claim Management Section */}
                    {isMyItem && item.claimRequests && item.claimRequests.length > 0 && (
                        <div className={`mt-8 p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                <Award className="w-5 h-5 mr-2 text-indigo-600" />
                                Claim Requests ({item.claimRequests.length})
                            </h3>
                            <div className="space-y-4">
                                {item.claimRequests.map((claim) => (
                                    <div key={claim._id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.claimant?.name || 'Unknown User'}</p>
                                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{claim.description}</p>
                                                {claim.verificationAnswers && (
                                                    <p className={`text-sm mt-1 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Answer: {claim.verificationAnswers}</p>
                                                )}
                                                <div className="mt-2 text-xs font-bold uppercase tracking-wide">
                                                    Status: <span className={`${claim.status === 'approved' ? 'text-green-600' :
                                                        claim.status === 'rejected' ? 'text-red-600' :
                                                            'text-yellow-600'
                                                        }`}>{claim.status}</span>
                                                </div>
                                            </div>

                                            {claim.status === 'pending' && (
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                const res = await axios.post(`${API_URL}/api/chats/initiate`,
                                                                    {
                                                                        itemId: item._id,
                                                                        recipientId: claim.claimant._id
                                                                    },
                                                                    { headers: { 'x-auth-token': token } }
                                                                );
                                                                navigate(`/chats/${res.data._id}`);
                                                            } catch (err) {
                                                                console.error('Error creating chat:', err);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center shadow-md transition-all active:scale-95"
                                                    >
                                                        <MessageCircle className="w-4 h-4 mr-1.5" /> Start Chat
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-4">
                    <div className={`p-6 rounded-xl shadow-sm border space-y-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        {/* Anonymous User Info */}
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                                {item.user.name ? item.user.name[0] : 'A'}
                            </div>
                            <div>
                                <div className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Anonymous User</div>
                                <div className="text-xs text-green-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Verified Student
                                </div>
                            </div>
                        </div>

                        {/* Chat Button - Only show if not user's own item, item is active, and user is not admin */}
                        {!isMyItem && item.status === 'active' && !user?.isAdmin ? (
                            <button
                                onClick={handleContact}
                                disabled={creatingChat}
                                className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                {creatingChat ? 'Connecting...' : 'Start Chat'}
                            </button>
                        ) : !isMyItem && !user?.isAdmin && (
                            <div className={`w-full py-3 rounded-lg border text-center font-medium ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                <span className="flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Item Resolved
                                </span>
                            </div>
                        )}

                        {/* Owner Actions & Admin Actions */}
                        {(isMyItem || (user && (user.isAdmin || user.email === 'websitedeve5@gmail.com'))) && item.status === 'active' && (
                            <div className="space-y-3">
                                {isMyItem && (
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to mark this item as resolved? It will be moved to the Resolved list.')) {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.put(`${API_URL}/api/items/${item._id}/resolve`, {}, {
                                                        headers: { 'x-auth-token': token }
                                                    });
                                                    alert('Item marked as resolved!');
                                                    navigate('/' + item.type); // Go back to list
                                                } catch (err) {
                                                    alert('Error resolving item');
                                                }
                                            }
                                        }}
                                        className="w-full flex items-center justify-center py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-medium border border-red-200"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Mark as Resolved
                                    </button>
                                )}

                                {/* Admin Force Delete Button */}
                                {(user && (user.isAdmin || user.email === 'websitedeve5@gmail.com')) && !isMyItem && (
                                    <button
                                        onClick={async () => {
                                            if (confirm('ADMIN ACTION: Are you sure you want to PERMANENTLY DELETE this item? This CANNOT be undone and will remove it from the database.')) {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.delete(`${API_URL}/api/items/${item._id}`, {
                                                        headers: { 'x-auth-token': token }
                                                    });
                                                    alert('Item permanently deleted by Admin.');
                                                    navigate('/');
                                                } catch (err) {
                                                    alert('Error deleting item');
                                                }
                                            }
                                        }}
                                        className="w-full flex items-center justify-center py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg"
                                    >
                                        <Shield className="w-5 h-5 mr-2" />
                                        Force Delete (Admin)
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Claim Button - Only for found items, not own items */}
                        {!isMyItem && item.type === 'found' && item.status === 'active' && (
                            <button
                                onClick={() => setShowClaimModal(true)}
                                className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md"
                            >
                                <Award className="w-5 h-5 mr-2" />
                                Claim This Item
                            </button>
                        )}

                        {/* Community Verification */}
                        <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Community Verification</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVote('upvote')}
                                    disabled={voting}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-lg transition-colors disabled:opacity-50 ${isDarkMode ? 'border-green-700 text-green-400 hover:bg-green-900/30' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span className="font-medium">{item.upvotes?.length || 0}</span>
                                </button>
                                <button
                                    onClick={() => handleVote('downvote')}
                                    disabled={voting}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-lg transition-colors disabled:opacity-50 ${isDarkMode ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                    <span className="font-medium">{item.downvotes?.length || 0}</span>
                                </button>
                            </div>
                            <div className="mt-2 text-center">
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Verification Score: <span className="font-bold text-indigo-600">
                                        {(item.upvotes?.length || 0) - (item.downvotes?.length || 0)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Safety Tip */}
                    <div className={`p-4 rounded-xl border text-sm ${isDarkMode ? 'bg-blue-900/30 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                        <h4 className="font-bold mb-1 flex items-center"><Shield className="w-4 h-4 mr-1" /> Safety Tip</h4>
                        Meet in public places like the Library or Admin Block when exchanging items.
                    </div>
                </div>
            </div>

            {/* Claim Modal */}
            {showClaimModal && (
                <ClaimModal
                    item={item}
                    onClose={() => setShowClaimModal(false)}
                    onSuccess={() => {
                        alert('Claim submitted successfully! The item owner will review your request.');
                        fetchItem(); // Refresh item data
                    }}
                />
            )}
        </div>
    );
};

export default ItemDetails;
