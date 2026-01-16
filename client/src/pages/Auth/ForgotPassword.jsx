```
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import API_URL from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await axios.post(`${ API_URL } /api/auth / forgot - password`, { email });
            setMessage('OTP sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Check email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await axios.post(`${ API_URL } /api/auth / reset - password`, { email, otp, newPassword });
            setMessage('Password reset successful! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Invalid OTP?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <div className={`w - full max - w - md p - 8 rounded - xl shadow - lg ${ isDarkMode ? 'bg-gray-800' : 'bg-white' } `}>
                <div className="text-center mb-6">
                    <h2 className={`text - 3xl font - bold ${ isDarkMode ? 'text-gray-100' : 'text-gray-900' } `}>Reset Password</h2>
                    <p className={`mt - 2 ${ isDarkMode ? 'text-gray-400' : 'text-gray-500' } `}>
                        {step === 1 ? 'Enter your email to receive a code' : 'Create a new password'}
                    </p>
                </div>

                {error && (
                    <div className={`p - 3 mb - 4 text - sm rounded - lg text - center ${ isDarkMode ? 'text-red-300 bg-red-900/50' : 'text-red-500 bg-red-50' } `}>
                        {error}
                    </div>
                )}
                {message && (
                    <div className={`p - 3 mb - 4 text - sm rounded - lg text - center ${ isDarkMode ? 'text-green-300 bg-green-900/50' : 'text-green-500 bg-green-50' } `}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-6">
                        <div className="space-y-2">
                            <label className={`text - sm font - medium ${ isDarkMode ? 'text-gray-300' : 'text-gray-700' } `}>Email Address</label>
                            <div className="relative">
                                <Mail className={`absolute left - 3 top - 3 w - 5 h - 5 ${ isDarkMode ? 'text-gray-500' : 'text-gray-400' } `} />
                                <input
                                    type="email"
                                    required
                                    className={`w - full pl - 10 pr - 4 py - 2 border rounded - lg focus: ring - 2 focus: ring - indigo - 500 outline - none ${ isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900' } `}
                                    placeholder="you@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
                        >
                            {loading ? 'Sending...' : 'Send OTP Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className={`p - 3 rounded text - center text - sm mb - 2 ${ isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-800' } `}>
                            Code sent to <span className="font-bold">{email}</span>
                        </div>

                        <div className="space-y-2">
                            <label className={`text - sm font - medium ${ isDarkMode ? 'text-gray-300' : 'text-gray-700' } `}>OTP Code</label>
                            <div className="relative">
                                <KeyRound className={`absolute left - 3 top - 3 w - 5 h - 5 ${ isDarkMode ? 'text-gray-500' : 'text-gray-400' } `} />
                                <input
                                    type="text"
                                    required
                                    className={`w - full pl - 10 pr - 4 py - 2 border rounded - lg focus: ring - 2 focus: ring - indigo - 500 outline - none tracking - widest ${ isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900' } `}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text - sm font - medium ${ isDarkMode ? 'text-gray-300' : 'text-gray-700' } `}>New Password</label>
                            <div className="relative">
                                <Lock className={`absolute left - 3 top - 3 w - 5 h - 5 ${ isDarkMode ? 'text-gray-500' : 'text-gray-400' } `} />
                                <input
                                    type="password"
                                    required
                                    className={`w - full pl - 10 pr - 4 py - 2 border rounded - lg focus: ring - 2 focus: ring - indigo - 500 outline - none ${ isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900' } `}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className={`flex items - center justify - center ${ isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700' } `}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

