import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Tag, Type } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';
import MapPicker from '../../components/MapPicker';

const ReportItem = ({ type }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();

    // Redirect if not logged in (basic protection)
    // In real app, consider using a ProtectedRoute wrapper
    if (!isAuthenticated) {
        // This useEffect-like check is simple for now
    }

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Electronics',
        location: '',
        details: '',
        coordinates: null, // Store coordinates
        date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const locations = [
        'AB1', 'AB2', 'AB3', 'AB4', 'Gazebo/Clock court', 'Near A block', 'Near B block',
        'Near C block', 'Near D1 block', 'Near D2 block', 'MG Auditorium', 'Health Dispensary',
        'Student parking lot', 'Library', 'Admin Block', 'Near entrance gate', 'Cricket ground',
        'AB1 lawn', 'Tennis Court', 'North Square', 'Gym', 'Swimming pool', 'Gymkhana'
    ];

    const categories = ['Electronics', 'Wallet', 'Phone', 'Keys', 'Clothing', 'ID Card', 'Notebook', 'Other'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationSelect = (geoJSON) => {
        setFormData(prev => ({ ...prev, coordinates: geoJSON }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Spam/Trash Report Prevention
        // Text check for spam/unwanted keywords
        const textToCheck = (formData.title + ' ' + formData.description).toLowerCase();

        // 1. Ambiguous Words Warning (e.g. 'chain' -> jewelry vs peace)
        const ambiguousKeywords = ['chain'];
        const foundAmbiguous = ambiguousKeywords.find(k => new RegExp(`\\b${k}\\b`).test(textToCheck));

        if (foundAmbiguous) {
            alert(
                `Ambiguous word detected: "${foundAmbiguous}"\n` +
                `Please use a more descriptive term to avoid confusion.\n` +
                `Examples: 'gold chain', 'bicycle chain', 'silver necklace'.\n` +
                `Reports with vague words are not allowed.`
            );
            return;
        }

        // 2. Strict Blocking for Abstract/Joke items
        // Check for exact word matches to avoid blocking substrings in valid words
        const blockedKeywords = [
            'heart', 'hrt', 'hart',
            'love', 'luv', 'lov', 'pyar', 'pyaar', 'peyar', 'mohabbat', 'ishq',
            'virginity', 'virgin',
            'soul', 'sool', 'rooh',
            'sanity', 'mental',
            'hope',
            'dignity', 'izzat', 'ijjat',
            'girlfriend', 'gf', 'girl friend', 'bandit',
            'boyfriend', 'bf', 'boy friend',
            'will to live', 'reason to live',
            'dil', 'dill', 'deel',
            'zindagi', 'jindagi', 'life', 'lyf',
            'dimag', 'dimaag', 'bheja',
            'babu', 'shona', 'baby',
            'kaljaa', 'jigar', 'liver', 'kidney'
        ];
        const foundKeyword = blockedKeywords.find(k => new RegExp(`\\b${k}\\b`).test(textToCheck));

        if (foundKeyword) {
            alert(
                `Report Blocked: The word "${foundKeyword}" is not allowed.\n` +
                `Please only report real, tangible physical items (e.g. keys, phone, wallet).\n` +
                `Abstract concepts, jokes, or non-material items are not permitted.`
            );
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            // Use default coordinates if none selected (VIT Chennai)
            const finalCoordinates = formData.coordinates || {
                type: 'Point',
                coordinates: [12.8406, 80.1534]
            };

            await axios.post(`${API_URL}/api/items`, {
                ...formData,
                type,
                location: {
                    main: formData.location,
                    details: formData.details
                },
                coordinates: finalCoordinates,
                images: [] // Send empty array as per new requirement
            }, {
                headers: { 'x-auth-token': token }
            });

            navigate(`/${type}`);
        } catch (err) {
            console.error('Error creating item:', err);
            alert('Failed to create item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className={`text-3xl font-bold mb-6 capitalize ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Report {type} Item</h1>

            <form onSubmit={handleSubmit} className={`space-y-6 p-6 rounded-xl shadow-lg border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                {/* Map Selection - Prominent */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pinpoint Location on Map</label>
                    <MapPicker onLocationSelect={handleLocationSelect} />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click on the map or drag the marker to the exact spot where the item was {type}.</p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Item Name</label>
                    <div className="relative">
                        <Type className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            name="title"
                            required
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                            placeholder="e.g. Blue iPhone 13"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date {type === 'lost' ? 'Lost' : 'Found'}</label>
                    <input
                        type="date"
                        name="date"
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 [color-scheme:dark]' : 'bg-white border-gray-300 text-gray-900'}`}
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                    <div className="relative">
                        <Tag className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <select
                            name="category"
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {/* Location Dropdown */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nearest Landmark / Area</label>
                    <div className="relative">
                        <MapPin className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <select
                            name="location"
                            required
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={formData.location}
                            onChange={handleChange}
                        >
                            <option value="">Select Location</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                </div>

                {/* Location Details */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Specific Location Details</label>
                    <textarea
                        name="details"
                        required
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="e.g. Left on the third bench near the fountain"
                        rows="2"
                        value={formData.details}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Description - Mandatory */}
                <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                    <textarea
                        name="description"
                        required
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Any specific marks, color details, or contents..."
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 text-white font-bold tracking-wide rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95
            ${type === 'lost'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 hover:shadow-red-500/50'
                            : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/30 hover:shadow-green-500/50'}
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
                >
                    {loading ? 'Submitting...' : `Submit ${type} Report`}
                </button>
            </form>
        </div>
    );
};

export default ReportItem;
