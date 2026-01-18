import React from 'react';

const BackgroundEffects = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Huge top-right glow */}
            <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>

            {/* Large bottom-left accent */}
            <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

            {/* Medium center-right */}
            <div className="absolute top-1/3 -right-32 w-64 h-64 bg-gradient-to-br from-pink-500/15 to-orange-500/15 rounded-full blur-2xl animate-pulse"></div>

            {/* Small accent top-left */}
            <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>
    );
};

export default BackgroundEffects;
