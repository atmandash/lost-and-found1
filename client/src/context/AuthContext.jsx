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
            console.error('Auth Error:', err);
            // Only remove token if it's strictly an auth error (401) or User Not Found (404)
            if (err.response && (err.response.status === 401 || err.response.status === 404)) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setUser(null);
            }
            // For other errors (like 500 or network), we keep the token
            // This prevents logging out users when server restarts
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
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
