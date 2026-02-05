import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            handleVerification(token);
        } else {
            setStatus('error');
        }
    }, []);

    const handleVerification = async (token) => {
        const success = await verifyEmail(token);
        if (success) {
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px' }}>
                {status === 'verifying' && <h2>Verifying your email...</h2>}

                {status === 'success' && (
                    <>
                        <h2 style={{ color: 'var(--primary-accent)' }}>Email Verified!</h2>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>You will be redirected to login shortly.</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 style={{ color: '#ff6b6b' }}>Verification Failed</h2>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>The link may be invalid or expired.</p>
                        <button onClick={() => navigate('/login')} className="glass-btn" style={{ marginTop: '2rem' }}>
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
