import React from 'react';

// Skeleton for Item Card
export const ItemCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div className="skeleton h-48 w-full rounded-lg"></div>
            <div className="skeleton h-6 w-3/4"></div>
            <div className="skeleton h-4 w-1/2"></div>
            <div className="flex gap-2">
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-20"></div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="skeleton h-10 flex-1"></div>
                <div className="skeleton h-10 flex-1"></div>
            </div>
        </div>
    );
};

// Skeleton for List
export const ListSkeleton = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ItemCardSkeleton key={i} />
            ))}
        </div>
    );
};

// Skeleton for Profile
export const ProfileSkeleton = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="skeleton w-20 h-20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="skeleton h-6 w-1/3"></div>
                        <div className="skeleton h-4 w-1/2"></div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 space-y-3">
                <div className="skeleton h-5 w-1/4"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-3/4"></div>
            </div>
        </div>
    );
};

// Skeleton for Chat
export const ChatSkeleton = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className="skeleton h-16 w-2/3 rounded-2xl"></div>
                </div>
            ))}
        </div>
    );
};

// Loading Spinner
export const Spinner = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`${sizes[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full spin`}></div>
    );
};

// Loading Dots
export const LoadingDots = () => {
    return (
        <div className="flex gap-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full loading-dot"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full loading-dot"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full loading-dot"></div>
        </div>
    );
};

// Full Page Loading
export const PageLoading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    );
};

export default {
    ItemCardSkeleton,
    ListSkeleton,
    ProfileSkeleton,
    ChatSkeleton,
    Spinner,
    LoadingDots,
    PageLoading
};
