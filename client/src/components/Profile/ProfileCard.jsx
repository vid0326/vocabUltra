import React, { useRef } from 'react';
import { FaCamera, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ProfileCard = ({ onClose }) => {
    const { user, logout, updateAvatar } = useAuth();
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            await updateAvatar(formData);
        }
    };

    if (!user) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            width: '300px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'var(--text-main)'
        }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--primary-accent)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.1)'
                }}>
                    {user.avatar ? (
                        <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <FaUser size={40} color="var(--text-muted)" />
                    )}
                </div>}
                <button
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        position: 'absolute',
                        bottom: '-5px',
                        right: '-5px',
                        background: 'var(--primary-accent)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        zIndex: 10
                    }}
                >
                    <FaCamera size={12} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{user.username}</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
            <button
                onClick={() => {
                    logout();
                    if (onClose) onClose();
                }}
                className="glass-btn"
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'rgba(255, 60, 60, 0.2)',
                    borderColor: 'rgba(255, 60, 60, 0.3)'
                }}
            >
                <FaSignOutAlt /> Sign Out
            </button>
        </div>
    );
};

export default ProfileCard;
