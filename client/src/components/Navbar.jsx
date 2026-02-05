import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaHome, FaList, FaQuestionCircle, FaStickyNote, FaKeyboard, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ProfileCard from './Profile/ProfileCard';

const Navbar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const navLinks = [
        { to: '/', icon: <FaHome />, text: 'Home' },
        { to: '/dictionary', icon: <FaBook />, text: 'Search' },
        { to: '/my-words', icon: <FaList />, text: 'My Collection' },
        { to: '/notes', icon: <FaStickyNote />, text: 'Notes' },
        { to: '/typing', icon: <FaKeyboard />, text: 'Typing' },
        { to: '/quiz', icon: <FaQuestionCircle />, text: 'Quiz' }
    ];

    return (
        <>
            <nav className="glass-panel" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                margin: '1rem auto',
                maxWidth: '1200px',
                width: '95%',
                position: 'relative'
            }}>
                <div className="logo">
                    <h1 className="gradient-text" style={{
                        fontSize: window.innerWidth <= 480 ? '1.2rem' : '1.5rem',
                        margin: 0
                    }}>VocabUltra</h1>
                </div>
                <div className="desktop-only links" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {navLinks.map(link => (
                        <NavLink key={link.to} to={link.to} icon={link.icon} text={link.text} active={isActive(link.to)} />
                    ))}

                    {user ? (
                        <div ref={profileRef} style={{ position: 'relative', marginLeft: '1rem' }}>
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="avatar"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '2px solid var(--primary-accent)',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '2px solid var(--primary-accent)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: 'rgba(255,255,255,0.1)'
                                    }}>
                                        <FaUser color="var(--text-main)" />
                                    </div>
                                )}
                            </button>

                            {showProfile && (
                                <ProfileCard onClose={() => setShowProfile(false)} />
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className={`nav-link ${isActive('/login')}`} style={{
                            textDecoration: 'none',
                            padding: '0.5rem 1rem',
                            marginLeft: '1rem',
                            border: '1px solid var(--primary-accent)',
                            borderRadius: '20px',
                            color: 'var(--text-main)'
                        }}>
                            Login
                        </Link>
                    )}
                </div>}
                <button
                    className="mobile-only"
                    onClick={toggleMobileMenu}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <FaBars />
                </button>
            </nav>
            {mobileMenuOpen && (
                <div
                    onClick={toggleMobileMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 998,
                        animation: 'fadeIn 0.3s'
                    }}
                />
            )}
            <div style={{
                position: 'fixed',
                top: 0,
                right: mobileMenuOpen ? 0 : '-100%',
                width: '75%',
                maxWidth: '300px',
                height: '100vh',
                background: 'var(--bg-gradient)',
                backdropFilter: 'blur(10px)',
                zIndex: 999,
                transition: 'right 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 1.5rem',
                boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
                overflowY: 'auto'
            }}>
                {/* Close Button */}
                <button
                    onClick={toggleMobileMenu}
                    style={{
                        alignSelf: 'flex-end',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        minWidth: '44px',
                        minHeight: '44px'
                    }}
                >
                    <FaTimes />
                </button>
                {user && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1rem',
                        background: 'var(--glass-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--primary-accent)',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                border: '2px solid var(--primary-accent)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.1)'
                            }}>
                                <FaUser color="var(--text-main)" size={24} />
                            </div>
                        )}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                                fontWeight: 'bold',
                                color: 'var(--text-main)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user.username || user.email}
                            </div>
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Navigation Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            style={{
                                textDecoration: 'none',
                                color: isActive(link.to) ? 'var(--text-main)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: isActive(link.to) ? 'var(--glass-border)' : 'transparent',
                                border: '1px solid',
                                borderColor: isActive(link.to) ? 'var(--primary-accent)' : 'transparent',
                                transition: 'all 0.2s ease',
                                fontSize: '1.1rem',
                                minHeight: '50px'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                            <span>{link.text}</span>
                        </Link>
                    ))}
                </div>
                {!user ? (
                    <Link
                        to="/login"
                        className="glass-btn"
                        style={{
                            textDecoration: 'none',
                            textAlign: 'center',
                            marginTop: '1rem',
                            display: 'block',
                            padding: '1rem'
                        }}
                    >
                        Login
                    </Link>
                ) : null}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
};

const NavLink = ({ to, icon, text, active }) => (
    <Link to={to} style={{
        textDecoration: 'none',
        color: active ? 'var(--text-main)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        background: active ? 'var(--glass-border)' : 'transparent',
        transition: 'all 0.3s ease'
    }}>
        {icon}
        <span>{text}</span>
    </Link>
);

export default Navbar;
