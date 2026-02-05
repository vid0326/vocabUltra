import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import GoogleBtn from './GoogleBtn';
import { FaUser, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

const AuthForm = ({ onSuccess }) => {
    const [mode, setMode] = useState('login'); 
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const { login, register, verifyEmail, forgotPassword, resetPassword } = useAuth(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'login') {
            const success = await login(formData.email, formData.password);
            if (success && onSuccess) onSuccess();
        } else if (mode === 'register') {
            const success = await register(formData.username, formData.email, formData.password);
            if (success) setMode('verify-otp');
        } else if (mode === 'verify-otp') {
            const success = await verifyEmail(formData.email, formData.otp);
            if (success) {

                const loginSuccess = await login(formData.email, formData.password);
                if (loginSuccess && onSuccess) onSuccess();
                else setMode('login');
            }
        } else if (mode === 'forgot-password') {
            const success = await forgotPassword(formData.email);
            if (success) setMode('reset-password');
        } else if (mode === 'reset-password') {
            const success = await resetPassword(formData.email, formData.otp, formData.password);
            if (success) {
                setMode('login');
                setFormData({ ...formData, password: '', otp: '' });
            }
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            {['login', 'register'].includes(mode) && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setMode('login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: mode === 'login' ? 'var(--primary-accent)' : 'var(--text-muted)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            padding: '0.5rem 1rem',
                            borderBottom: mode === 'login' ? '2px solid var(--primary-accent)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: mode === 'register' ? 'var(--primary-accent)' : 'var(--text-muted)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            padding: '0.5rem 1rem',
                            borderBottom: mode === 'register' ? '2px solid var(--primary-accent)' : 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Register
                    </button>
                </div>
            )}
            {!['login', 'register'].includes(mode) && (
                <h3 style={{ textAlign: 'center', color: 'var(--primary-accent)', marginBottom: '1.5rem' }}>
                    {mode === 'verify-otp' && 'Verify Account'}
                    {mode === 'forgot-password' && 'Reset Password'}
                    {mode === 'reset-password' && 'Set New Password'}
                </h3>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {mode === 'verify-otp' && (
                    <>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Enter the code sent to {formData.email}
                        </p>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter 6-digit OTP"
                                value={formData.otp || ''}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    letterSpacing: '5px',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <button type="submit" className="glass-btn" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                            Verify & Login
                        </button>
                    </>
                )}
                {mode === 'register' && (
                    <div style={{ position: 'relative' }}>
                        <FaUser style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}
                {['login', 'register', 'forgot-password'].includes(mode) && (
                    <div style={{ position: 'relative' }}>
                        <FaEnvelope style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}
                {['login', 'register', 'reset-password'].includes(mode) && (
                    <div style={{ position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder={mode === 'reset-password' ? "New Password" : "Password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 40px 12px 40px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                )}
                {mode === 'reset-password' && (
                    <div style={{ position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            name="otp"
                            placeholder="Verification Code"
                            value={formData.otp || ''}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                outline: 'none',
                                letterSpacing: '5px'
                            }}
                        />
                    </div>
                )}


                {mode === 'login' && (
                    <>
                        <div style={{ textAlign: 'right' }}>
                            <button
                                type="button"
                                onClick={() => setMode('forgot-password')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-accent)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <button type="submit" className="glass-btn" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                            <FaSignInAlt /> Login
                        </button>
                    </>
                )}

                {mode === 'register' && (
                    <button type="submit" className="glass-btn" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        <FaUserPlus /> Register
                    </button>
                )}

                {mode === 'forgot-password' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button type="submit" className="glass-btn" style={{ justifyContent: 'center' }}>
                            Send Reset Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {mode === 'reset-password' && (
                    <button type="submit" className="glass-btn" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                        Reset Password
                    </button>
                )}
            </form>
            {['login', 'register'].includes(mode) && (
                <>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', position: 'relative' }}>
                        <span style={{ background: 'var(--bg-gradient)', padding: '0 10px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>or continue with</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'var(--glass-border)', zIndex: 0 }} />
                    </div>

                    <GoogleBtn onSuccess={onSuccess} />
                </>
            )}
        </div>
    );
};

export default AuthForm;
