import React from 'react';
import { Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
    const { isDarkMode } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`py-6 mt-auto ${isDarkMode ? 'bg-transparent text-gray-400' : 'bg-transparent text-gray-600'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">

                    {/* Credits */}
                    <div className="flex flex-col gap-2 items-center md:items-start">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
                            <span>Made by Atman Dash, Alok Singh & Shreyansh Jha</span>
                        </div>
                        <p className="text-xs opacity-70">
                            &copy; {currentYear} Lost & Found. All rights reserved.
                        </p>
                    </div>

                    {/* Contact - Enhanced Visibility */}
                    <div className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full md:w-auto transform">
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=websitedeve5@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold tracking-wide hover:text-teal-300 transition-colors whitespace-nowrap"
                        >
                            websitedeve5@gmail.com
                        </a>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
