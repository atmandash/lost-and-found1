import React, { useState, useEffect } from 'react';
import { X, Bell, Loader, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const WatchlistModal = ({ isOpen, onClose, type, prefillItem }) => {
    const [keywords, setKeywords] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
    const { isDarkMode } = useTheme();

    // Helper to clean keywords
    const extractKeywords = (title) => {
        if (!title) return '';
        const stopwords = ['lost', 'found', 'missing', 'stolen', 'active', 'new', 'old', 'my', 'a', 'an', 'the', 'with', 'of'];
        const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'silver', 'gold', 'grey', 'gray', 'purple', 'orange', 'brown', 'pink'];

        return title.toLowerCase()
            .replace(/[0-9]/g, '') // Remove numbers (e.g. 13)
            .split(/\s+/)
            .filter(w => w.length > 2) // Remove short words
            .filter(w => !stopwords.includes(w))
            .filter(w => !colors.includes(w))
            .join(' ');
    };

    // Auto-fill from active report
    useEffect(() => {
        if (prefillItem) {
            const cleanTitle = extractKeywords(prefillItem.title);
            setKeywords(cleanTitle || prefillItem.title || ''); // Fallback to title if empty
            setCategory(prefillItem.category || '');
        }
    }, [prefillItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            // Split keywords by comma or space
            const keywordList = keywords.split(/[\s,]+/).filter(k => k.trim());

            await axios.post('http://localhost:5000/api/watchlist', {
                keywords: keywordList,
                category
            }, {
                headers: { 'x-auth-token': token }
            });

            setMessage({ type: 'success', text: 'Alert created! We/ll notify you when a match is found.' });
            setTimeout(() => {
                onClose();
                setKeywords('');
                setMessage(null);
            }, 2000);
        } catch (err) {
            console.error(err);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to create alert.'
            });
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Electronics', 'Wallet', 'Phone', 'Keys', 'Clothing', 'ID Card', 'Notebook', 'Other'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl transform transition-all scale-100 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Bell className="w-5 h-5" />
                        </div>
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Create Alert</h2>
                    </div>
                    <button onClick={onClose} className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Keywords
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Blue iPhone, Casio Watch"
                            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                        />
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Separate multiple keywords with spaces.</p>
                    </div>

                    <div className="relative">
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Category (Optional)
                        </label>
                        <select
                            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <ChevronDown className={`absolute right-3 top-[34px] w-5 h-5 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25
                            `}
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Notify Me'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WatchlistModal;
