import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        
        setAuthToken(token);

        try {
            const res = await axios.get('http://localhost:5000/api/auth/me');
            setUser(res.data);
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            setAuthToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);
            setUser(res.data.user);
            toast.success('Logged in successfully');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login failed');
            return false;
        }
    };

    const googleLogin = async (token) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/google', { token });
            localStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);
            setUser(res.data.user);
            toast.success('Logged in with Google');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Google login failed');
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
            toast.success(res.data.msg);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Registration failed');
            return false;
        }
    };

    const updateAvatar = async (formData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(res.data); 
            toast.success('Avatar updated successfully');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Failed to update avatar');
            return false;
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-email', { email, otp });
            toast.success(res.data.msg);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Verification failed');
            return false;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            toast.success(res.data.msg);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to send reset code');
            return false;
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
            toast.success(res.data.msg);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to reset password');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        toast.success('Logged out');
    };

    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, verifyEmail, forgotPassword, resetPassword, updateAvatar }}>
            {children}
        </AuthContext.Provider>
    );
};
