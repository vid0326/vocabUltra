import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;

    return (
        <div className="home-page">
            <header style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}>
                <h1 className="gradient-text" style={{
                    fontSize: isMobile ? '2rem' : (isTablet ? '2.5rem' : '3.5rem'),
                    marginBottom: '1rem'
                }}>
                    Expand Your Lexicon
                </h1>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    padding: isMobile ? '0 1rem' : '0'
                }}>
                    Master new words daily with our premium vocabulary builder.
                    Search, Save, and Quiz yourself to perfection.
                </p>

                <div style={{
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: isMobile ? '0 1rem' : '0'
                }}>
                    <Link to="/dictionary" className="glass-btn" style={{
                        width: isMobile ? '100%' : 'auto',
                        padding: '12px 24px'
                    }}>Start Searching</Link>
                    <Link to="/quiz" className="glass-btn" style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        width: isMobile ? '100%' : 'auto',
                        padding: '12px 24px'
                    }}>Take a Quiz</Link>
                </div>
            </header>

            <div className="features_grid" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))'),
                gap: isMobile ? '1rem' : '2rem',
                padding: isMobile ? '0 1rem' : '0'
            }}>
                <div className="glass-panel" style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                    <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Dictionary Lookup</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                        Instant access to definitions, synonyms, and examples from trusted sources.
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                    <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Personal Collection</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                        Save words you want to learn. Build your own customized dictionary.
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                    <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>Daily Quizzes</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                        Test your knowledge with auto-generated quizzes based on your collection.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
