import React from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                    Lost Something? <br />
                    <span className="text-indigo-600">Let's find it.</span>
                </h1>
                <p className="text-lg text-gray-500 max-w-lg mx-auto">
                    The fastest way to reunite with your lost items on campus.
                    Connect with the community instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                {/* Lost Button */}
                <Link
                    to="/report/lost"
                    className="group relative flex flex-col items-center justify-center p-10 bg-white border-2 border-red-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-red-500 transition-all duration-300"
                >
                    <div className="bg-red-100 p-6 rounded-full mb-4 group-hover:bg-red-500 transition-colors">
                        <Search className="w-12 h-12 text-red-500 group-hover:text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">I LOST SOMETHING</h2>
                    <p className="text-gray-500 mt-2 text-center">Report a lost item and notify others nearby</p>
                </Link>

                {/* Found Button */}
                <Link
                    to="/report/found"
                    className="group relative flex flex-col items-center justify-center p-10 bg-white border-2 border-green-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300"
                >
                    <div className="bg-green-100 p-6 rounded-full mb-4 group-hover:bg-green-500 transition-colors">
                        <PlusCircle className="w-12 h-12 text-green-500 group-hover:text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">I FOUND SOMETHING</h2>
                    <p className="text-gray-500 mt-2 text-center">Report a found item and get karma points</p>
                </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 text-center w-full max-w-xl">
                <div>
                    <div className="text-3xl font-bold text-indigo-600">124</div>
                    <div className="text-sm text-gray-500">Items Reunited</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-indigo-600">500+</div>
                    <div className="text-sm text-gray-500">Active Students</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-indigo-600">24/7</div>
                    <div className="text-sm text-gray-500">Community Support</div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
