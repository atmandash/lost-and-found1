import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';

const UserManagement = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/users`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to permanently delete user "${userName}" and all their data? This cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/auth/users/${userId}`, {
                headers: { 'x-auth-token': token }
            });
            alert('User deleted successfully');
            fetchUsers(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.filter(u => !u.isAdmin && u._id !== user?.id).length) {
            setSelectedUsers(new Set());
        } else {
            const selectableUsers = filteredUsers.filter(u => !u.isAdmin && u._id !== user?.id);
            setSelectedUsers(new Set(selectableUsers.map(u => u._id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)? This cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/users/bulk-delete`, {
                userIds: Array.from(selectedUsers)
            }, {
                headers: { 'x-auth-token': token }
            });

            alert(`Successfully deleted ${selectedUsers.size} users`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting users');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-20">Loading users...</div>;

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 space-y-6">
                {/* Header */}
                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-8 h-8 text-red-600" />
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    User Management
                                </h1>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Admin Panel - Manage user accounts
                                </p>
                            </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Users className="w-5 h-5" />
                            <span className="font-bold">{users.length} Total Users</span>
                        </div>
                    </div>

                    {/* Select All Checkbox */}
                    {filteredUsers.filter(u => !u.isAdmin && u._id !== user?.id).length > 0 && (
                        <div className="mt-4 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.filter(u => !u.isAdmin && u._id !== user?.id).length}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <label htmlFor="select-all" className={`text-sm font-medium cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Select All ({filteredUsers.filter(u => !u.isAdmin && u._id !== user?.id).length} users)
                            </label>
                            {selectedUsers.size > 0 && (
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    • {selectedUsers.size} selected
                                </span>
                            )}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                    </div>
                </div>

                {/* Users List - Mobile Cards / Desktop Table */}
                <div className="space-y-4">
                    {filteredUsers.map((u) => (
                        <div
                            key={u._id}
                            className={`p-4 rounded-xl border relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
                        >
                            {/* Delete Button - Top Right */}
                            {u._id !== user?.id && !u.isAdmin && (
                                <button
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    className="absolute top-3 right-3 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                                    title="Delete user"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="hidden md:inline font-medium">Delete</span>
                                </button>
                            )}

                            <div className="flex items-start gap-4 pr-16">
                                {/* Checkbox for bulk selection */}
                                {u._id !== user?.id && !u.isAdmin && (
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(u._id)}
                                        onChange={() => toggleUserSelection(u._id)}
                                        className="mt-4 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
                                    />
                                )}

                                {/* Avatar */}
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {u.name[0]}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                            {u.name}
                                        </h3>
                                        {u.isAdmin && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                    {!u.isAdmin && (
                                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                            {u.email}
                                        </p>
                                    )}

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                                        <div>
                                            <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                                {u.points || 0}
                                            </span>
                                            <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                points
                                            </span>
                                        </div>
                                        <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                        <div>
                                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                                {u.itemsReported || 0} items
                                            </span>
                                        </div>
                                        <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                                        <div>
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Joined {new Date(u.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No users found matching "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Bulk Actions Toolbar - Fixed Bottom */}
                {selectedUsers.size > 0 && (
                    <div className="fixed bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
                        <div className={`flex items-center gap-4 px-6 py-4 rounded-lg shadow-2xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedUsers(new Set())}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode
                                    ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                    }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
