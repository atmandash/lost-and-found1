import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { Trophy, Award, TrendingUp, Medal } from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real-time polling with 15-second interval (only when tab is visible)
    useEffect(() => {
        fetchLeaderboard(); // Initial fetch

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchLeaderboard();
            }
        }, 15000); // Poll every 15 seconds

        // Refresh on window focus
        const handleFocus = () => fetchLeaderboard();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/gamification/leaderboard?limit=20`);
            setLeaderboard(res.data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="text-gray-500 font-bold">#{index + 1}</span>;
    };

    const getRankBg = (index) => {
        if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
        if (index === 1) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
        if (index === 2) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
        return 'bg-white border-gray-100';
    };

    if (loading) {
        return <div className="text-center py-20">Loading leaderboard...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Trophy className="w-10 h-10 text-yellow-500" />
                            Leaderboard
                        </h1>
                        <p className="text-gray-600">Top contributors in our Lost & Found community</p>
                    </div>
                    {/* Live Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-700 font-medium">Live</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {leaderboard.map((user, index) => (
                    <div
                        key={user._id}
                        className={`p-4 rounded-xl border-2 ${getRankBg(index)} transition-all duration-300 hover:shadow-md animate-fade-in`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0 w-12 flex items-center justify-center">
                                {getRankIcon(index)}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg truncate">{user.name}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" />
                                        Level {user.level}
                                    </span>
                                    <span>•</span>
                                    <span>{user.itemsReported || 0} items reported</span>
                                </div>
                            </div>

                            {/* Points */}
                            <div className="flex-shrink-0 text-right">
                                <div className="text-2xl font-bold text-indigo-600">{user.points}</div>
                                <div className="text-xs text-gray-500">points</div>
                            </div>

                            {/* Badges */}
                            {user.badges && user.badges.length > 0 && (
                                <div className="hidden sm:flex flex-shrink-0 gap-1">
                                    {user.badges.slice(0, 3).map((badge, idx) => (
                                        <div
                                            key={idx}
                                            className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                                            title={badge}
                                        >
                                            <Award className="w-4 h-4 text-white" />
                                        </div>
                                    ))}
                                    {user.badges.length > 3 && (
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            +{user.badges.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {leaderboard.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No leaderboard data yet. Be the first to contribute!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
