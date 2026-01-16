import React from 'react';
import { Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
    const { isDarkMode } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`py-8 mt-auto border-t ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">

                    {/* Credits */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium">
                            <span>Made by Atman Dash, Alok Singh, & Shreyansh Jha</span>
                        </div>
                        <p className="text-xs opacity-70">
                            &copy; {currentYear} Lost & Found. All rights reserved.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center justify-center gap-2 text-sm bg-indigo-50 dark:bg-gray-800 px-4 py-2.5 rounded-full border border-indigo-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=websitedeve5@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
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
