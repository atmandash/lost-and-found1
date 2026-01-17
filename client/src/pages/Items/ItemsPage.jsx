import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Bell } from 'lucide-react';
import ItemCard from '../../components/ItemCard';
import WatchlistModal from '../../components/WatchlistModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';

const ItemsPage = ({ type }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

    const { isAuthenticated, user } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    // Pull-to-Refresh Logic
    const [startY, setStartY] = useState(0);
    const [pullY, setPullY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        const y = e.touches[0].clientY;
        const diff = y - startY;
        if (window.scrollY === 0 && diff > 0) {
            setPullY(diff > 80 ? 80 : diff);
            // e.preventDefault(); // Can't prevent default in passive listener, so rely on overflow logic
        } else {
            setPullY(0);
        }
    };

    const handleTouchEnd = async () => {
        if (pullY > 60) {
            setRefreshing(true);
            setPullY(50); // Keep loading indicator visible
            await fetchItems(false);
            setRefreshing(false);
        }
        setPullY(0);
    };

    // Re-declare fetchItems outside useEffect to use in handleTouchEnd
    const fetchItems = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const res = await axios.get(`${API_URL}/api/items?type=${type}`);
            setItems(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Update useEffect to use the new fetchItems
    useEffect(() => {
        let isMounted = true;
        fetchItems(true);

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') fetchItems(false);
        }, 60000);

        return () => clearInterval(interval);
    }, [type]);

    const [view, setView] = useState('active');
    const [activeReportItem, setActiveReportItem] = useState(null);

    const handleReportClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/report/${type}` } });
        } else {
            navigate(`/report/${type}`);
        }
    };

    // Check if user has active lost report to show Alert button
    useEffect(() => {
        const checkActiveReport = async () => {
            if (isAuthenticated && user) {
                try {
                    const res = await axios.get(`${API_URL}/api/items?user=${user.id}&type=lost&status=active`);
                    if (res.data.length > 0) {
                        setActiveReportItem(res.data[0]); // Capture the first active item
                    } else {
                        setActiveReportItem(null);
                    }
                } catch (err) {
                    console.error('Error checking active report:', err);
                }
            }
        };
        checkActiveReport();
    }, [isAuthenticated, user, type]); // Re-check if type/user changes

    const filteredItems = (Array.isArray(items) ? items : []).filter(item => {
        // ULTRA-STRICT SAFE VALIDATION
        if (!item) return false;

        // Ensure essential properties exist to prevent crashes in ItemCard
        // We accept if properties are missing but return a safe fallback in the UI
        // But for filtering logic, we must be safe:

        try {
            // Status Filter - Safely check status
            const status = item.status || 'active'; // Default to active if missing
            const isResolved = ['resolved', 'claimed', 'reunited', 'closed'].includes(status);

            if (view === 'active' && isResolved) return false;
            if (view === 'resolved' && !isResolved) return false;

            // Search Filter - Safely check title and location
            const filterText = filter.toLowerCase();
            const title = (item.title || '').toLowerCase();
            const locationMain = (item.location?.main || '').toLowerCase();

            const titleMatch = title.includes(filterText);
            const locationMatch = locationMain.includes(filterText);

            return titleMatch || locationMatch;
        } catch (err) {
            console.error("Error filtering item:", item, err);
            return false; // Skip crashing items
        }
    });

    return (
        <div
            className="px-4 space-y-6 min-h-screen transition-transform ease-out duration-200"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ transform: `translateY(${pullY}px)` }}
        >
            {/* Refresh Indicator */}
            {pullY > 0 && (
                <div className="absolute top-[-50px] left-0 w-full flex justify-center items-center h-[50px] text-gray-500 text-sm font-medium">
                    {pullY > 60 || refreshing ? 'Refreshing...' : 'Pull to refresh'}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-bold capitalize ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {type === 'lost' ? 'Lost Items' : 'Found Items'}
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {type === 'lost'
                                ? 'Find your lost belongings'
                                : 'Check for the items that have been found'}
                        </p>
                        {lastUpdated && (
                            <div className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Updated {Math.floor((new Date() - lastUpdated) / 1000)}s ago</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Create Alert Button - Only for Lost Items & Users with Active Reports */}
                    {type === 'lost' && isAuthenticated && activeReportItem && (
                        <button
                            onClick={() => setIsWatchlistOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Alert</span>
                        </button>
                    )}

                    <button
                        onClick={handleReportClick}
                        className={`px-6 py-2 rounded-xl text-white font-bold tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95
                ${type === 'lost'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 hover:shadow-red-500/50'
                                : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/30 hover:shadow-green-500/50'}
              `}
                    >
                        Report {type === 'lost' ? 'Lost' : 'Found'} Item
                    </button>
                </div>
            </div>

            {/* Active / Resolved Tabs */}
            <div className="flex justify-center mb-0">
                <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <button
                        onClick={() => setView('active')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'active'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        Active Listings
                    </button>
                    <button
                        onClick={() => setView('resolved')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'resolved'
                            ? `${type === 'lost' ? 'bg-red-600' : 'bg-green-600'} text-white shadow-md`
                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                            }`}
                    >
                        Resolved / Closed
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className={`p-4 rounded-xl shadow-sm border flex gap-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="relative flex-grow max-w-md">
                    <Search className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        placeholder="Search by title or location..."
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-200 text-gray-900'}`}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {/* Expiration Disclaimer */}
            <div className={`text-center text-xs mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Note: Reports are automatically closed 30 days after creation.
            </div>

            {loading ? (
                <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading items...</div>
            ) : filteredItems.length === 0 ? (
                <div className={`text-center py-12 px-6 rounded-xl border border-dashed animate-fade-in ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>No items found</div>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {type === 'lost'
                            ? "We couldn't find any matching items right now. Try checking back later!"
                            : "No found items match your current search."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
                    {filteredItems.map(item => (
                        <ItemCard key={item._id} item={item} />
                    ))}
                </div>
            )}


            <WatchlistModal
                isOpen={isWatchlistOpen}
                onClose={() => setIsWatchlistOpen(false)}
                type={type}
                prefillItem={activeReportItem}
            />
        </div>
    );
};

// End of component
export default ItemsPage;

