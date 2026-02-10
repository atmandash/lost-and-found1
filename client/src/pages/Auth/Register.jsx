import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';
import { Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate VIT email
        if (!formData.email.endsWith('@vitstudent.ac.in')) {
            return setError('Please use your VIT email address (@vitstudent.ac.in)');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/request-otp`, {
                email: formData.email,
                phone: formData.phone
            });

            setSuccess(`OTP sent to ${formData.email}`);
            setStep(2);
        } catch (err) {
            console.error('OTP Request Failed:', err);
            // DEBUG: Log the full error response to console
            if (err.response) {
                console.log('Error Response Data:', err.response.data);
                console.log('Error Status:', err.response.status);
            }
            const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify & Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                otp: formData.otp
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check OTP and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12">
            <div className={`w-full max-w-md p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-3xl font-bold text-center mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Create Account
                </h2>
                <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step === 1 ? 'Join the community to help others' : 'Verify your email'}
                </p>

                {error && (
                    <div className={`p-3 mb-4 text-sm rounded-lg text-center ${isDarkMode ? 'text-red-300 bg-red-900/50' : 'text-red-500 bg-red-50'}`}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className={`p-3 mb-4 text-sm rounded-lg text-center font-medium ${isDarkMode ? 'text-green-300 bg-green-900/50' : 'text-green-600 bg-green-50'}`}>
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                            <div className="relative">
                                <User className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>VIT Email Address</label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    title="Please use your VIT email address (@vitstudent.ac.in)"
                                    placeholder="example@vitstudent.ac.in"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <p className="text-xs text-indigo-600">* Please use your VIT email address</p>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                            <div className="relative">
                                <Phone className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    title="Please enter exactly 10 digits"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const re = /^[0-9\b]+$/;
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            if (e.target.value.length <= 10) {
                                                handleChange(e);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                                        placeholder="••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm</label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                                        placeholder="••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all transform active:scale-95 duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending OTP...' : 'Next'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <div className="text-center mb-4">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    We sent a 6-digit code to <strong>{formData.email}</strong>
                                </p>
                            </div>
                            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enter OTP</label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input
                                    type="text"
                                    name="otp"
                                    required
                                    maxLength="6"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-center text-lg font-mono ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                                    placeholder="123456"
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all transform active:scale-95 duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                ← Back to Details
                            </button>
                        </div>
                    </form>
                )}

                <div className={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

