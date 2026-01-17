import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';
import ItemCard from '../../components/ItemCard';

const AdminItems = () => {
    const { user, isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Redirect non-admins
        if (!isAuthenticated || !user?.isAdmin) {
            navigate('/');
            return;
        }
        fetchAllItems();
    }, [user, isAuthenticated]);

    const fetchAllItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch both lost and found items
            const [lostRes, foundRes] = await Promise.all([
                axios.get(`${API_URL}/api/items?type=lost`, {
                    headers: { 'x-auth-token': token }
                }),
                axios.get(`${API_URL}/api/items?type=found`, {
                    headers: { 'x-auth-token': token }
                })
            ]);

            // Combine all items
            const allItems = [...lostRes.data, ...foundRes.data];
            setItems(allItems);
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter items by tab and search
    const filteredItems = items.filter(item => {
        // Tab filter
        const isActive = !['resolved', 'closed'].includes(item.status);
        if (activeTab === 'active' && !isActive) return false;
        if (activeTab === 'resolved' && isActive) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query) ||
                item.location?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Count items
    const activeCount = items.filter(i => !['resolved', 'closed'].includes(i.status)).length;
    const resolvedCount = items.filter(i => ['resolved', 'closed'].includes(i.status)).length;

    if (!user?.isAdmin) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className={`p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>All Items</h1>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Manage all lost and found reports
                </p>
            </div>

            {/* Search and Tabs */}
            <div className={`p-4 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-xl border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                    </div>

                    {/* Tabs */}
                    <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'active'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                }`}
                        >
                            <Clock className="w-4 h-4" />
                            Active ({activeCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('resolved')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'resolved'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Resolved ({resolvedCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className={`p-6 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading items...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {searchQuery ? 'No items match your search' : `No ${activeTab} items`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex justify-between items-center">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Showing {filteredItems.length} {activeTab} item{filteredItems.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map(item => (
                                <ItemCard key={item._id} item={item} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminItems;
