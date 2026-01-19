import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        loadUser();

        // Global Axios Interceptor for 401 Unauthorized
        // This failsafe ensures that if the ID token expires or is invalid,
        // the user is immediately logged out to prevent bad states.
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.warn('Session expired or invalid token. Logging out...');
                    console.warn('Failed URL:', error.config?.url);

                    // DEBUG: Alert using window.confirm so it doesn't block but is visible
                    // Showing the specific URL that failed is key to finding the "phantom" 401
                    const url = error.config?.url || 'unknown endpoint';
                    const reason = error.response.data?.message || 'Unknown Auth Error';
                    alert(`DEBUG: 401 Unauthorized at ${url}\nReason: ${reason}\n\nLogging out now...`);

                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/api/auth/me`, {
                headers: {
                    'x-auth-token': token
                }
            });
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Auth Error Details:', {
                status: err.response?.status,
                message: err.response?.data?.message || err.message,
                endpoint: `${API_URL}/api/auth/me`
            });
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        // Clear any old tokens/state before attempting new login
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);

        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data;
    };

    // Request OTP
    const requestOTP = async (email, phone) => {
        await axios.post(`${API_URL}/api/auth/request-otp`, { email, phone });
    };

    // Register User (Verify OTP)
    const register = async (formData) => {
        const res = await axios.post(`${API_URL}/api/auth/register`, formData);
        localStorage.setItem('token', res.data.token); // Assuming token is returned on successful registration
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        requestOTP,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
