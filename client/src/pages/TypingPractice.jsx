import React, { useState, useEffect, useRef } from 'react';
import { generateWords } from '../utils/wordList';
import { FaRedo, FaKeyboard } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TypingPractice = () => {
    // Game Config
    const TIME_LIMIT = 30;

    // State
    const [words, setWords] = useState([]);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [isActive, setIsActive] = useState(false);
    const [currWordIndex, setCurrWordIndex] = useState(0);
    const [currCharIndex, setCurrCharIndex] = useState(0);
    const [currInput, setCurrInput] = useState('');
    const [correctCharCount, setCorrectCharCount] = useState(0);
    const [incorrectCharCount, setIncorrectCharCount] = useState(0);
    const [status, setStatus] = useState('waiting'); // waiting, playing, finished
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    const [liveWpmData, setLiveWpmData] = useState([]); // Current session: { time, wpm }
    const [historyData, setHistoryData] = useState([]); // Past sessions: { name, wpm }

    const [typedHistory, setTypedHistory] = useState([]);
    const correctCharCountRef = useRef(0);
    const inputRef = useRef(null);
    const [bestScore, setBestScore] = useState(0);

    // Responsive detection
    const isMobile = window.innerWidth <= 480;

    // Mobile-specific state for controlled input
    const [mobileInputValue, setMobileInputValue] = useState('');

    useEffect(() => {
        resetGame();
        fetchBestScore();
    }, []);

    const fetchBestScore = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await fetch('http://localhost:5000/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (data.bestWpm) setBestScore(data.bestWpm);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        correctCharCountRef.current = correctCharCount;
    }, [correctCharCount]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = prevTime - 1;
                    const timeElapsed = TIME_LIMIT - newTime;
                    const currentWpm = Math.round(correctCharCountRef.current / 5 / (timeElapsed / 60)) || 0;
                    setLiveWpmData(prev => [...prev, { time: timeElapsed, wpm: currentWpm }]);
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            finishGame();
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const resetGame = () => {
        setWords(generateWords(60));
        setCurrWordIndex(0);
        setCurrCharIndex(0);
        setCurrInput('');
        setTimeLeft(TIME_LIMIT);
        setIsActive(false);
        setStatus('waiting');
        setCorrectCharCount(0);
        setIncorrectCharCount(0);
        setWpm(0);
        setAccuracy(0);
        setLiveWpmData([]);
        setHistoryData([]);
        setTypedHistory([]);
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    };

    const startGame = () => {
        setIsActive(true);
        setStatus('playing');
        setLiveWpmData([{ time: 0, wpm: 0 }]);
    };

    const finishGame = () => {
        setIsActive(false);
        setStatus('finished');
        calculateResults();
    };

    const calculateResults = async () => {
        const totalTimeMins = TIME_LIMIT / 60;
        const grossWpm = Math.round((correctCharCount / 5) / totalTimeMins);
        const netWpm = grossWpm || 0;
        const acc = correctCharCount + incorrectCharCount > 0
            ? Math.round((correctCharCount / (correctCharCount + incorrectCharCount)) * 100)
            : 0;

        setWpm(netWpm);
        setAccuracy(acc);

        // Save to Backend
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await fetch('http://localhost:5000/api/auth/typing-result', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ wpm: netWpm, accuracy: acc })
                });
                const data = await res.json();
                if (data.history) {
                    const last5 = data.history.slice(-5).map((h, i) => ({
                        name: `Test ${data.history.length - data.history.slice(-5).length + i + 1}`,
                        wpm: h.wpm
                    }));
                    setHistoryData(last5);
                    if (data.bestWpm) setBestScore(data.bestWpm);
                }
            }
        } catch (err) {
            console.error("Failed to save results", err);
        }
    };

    // ... handleKeyDown ...
    const handleKeyDown = (e) => {
        if (status === 'finished') return;
        e.stopPropagation();

        if (status === 'waiting' && e.key.length === 1) {
            startGame();
        }

        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            setTypedHistory(prev => [...prev, currInput]);
            setCurrWordIndex(currWordIndex + 1);
            setCurrCharIndex(0);
            setCurrInput('');
            return;
        }

        if (e.code === 'Backspace') {
            if (currCharIndex > 0) {
                setCurrCharIndex(currCharIndex - 1);
                setCurrInput(currInput.slice(0, -1));
            }
            return;
        }

        if (e.key.length === 1) {
            const char = e.key;
            const currentWord = words[currWordIndex];

            if (currentWord && currCharIndex < currentWord.length) {
                if (char === currentWord[currCharIndex]) {
                    setCorrectCharCount(prev => prev + 1);
                } else {
                    setIncorrectCharCount(prev => prev + 1);
                }
            } else {
                setIncorrectCharCount(prev => prev + 1);
            }

            setCurrInput(prev => prev + char);
            setCurrCharIndex(prev => prev + 1);
        }
    };

    // Mobile-specific handler - processes input changes instead of key events
    const handleMobileInput = (e) => {
        if (status === 'finished') return;

        const inputValue = e.target.value;

        // Start game on first character
        if (status === 'waiting' && inputValue.length > 0) {
            startGame();
        }

        // Handle space - move to next word
        if (inputValue.endsWith(' ')) {
            setTypedHistory(prev => [...prev, currInput]);
            setCurrWordIndex(currWordIndex + 1);
            setCurrCharIndex(0);
            setCurrInput('');
            setMobileInputValue(''); // Clear mobile input state
            return;
        }

        // Process each character
        const currentWord = words[currWordIndex];
        const newInput = inputValue;

        // Handle backspace (input got shorter)
        if (newInput.length < currInput.length) {
            if (currCharIndex > 0) {
                setCurrCharIndex(currCharIndex - 1);
                setCurrInput(newInput);
                setMobileInputValue(newInput);
            }
            return;
        }

        // Handle new character
        if (newInput.length > currInput.length) {
            const char = newInput[newInput.length - 1];

            if (currentWord && currCharIndex < currentWord.length) {
                if (char === currentWord[currCharIndex]) {
                    setCorrectCharCount(prev => prev + 1);
                } else {
                    setIncorrectCharCount(prev => prev + 1);
                }
            } else {
                setIncorrectCharCount(prev => prev + 1);
            }

            setCurrInput(newInput);
            setCurrCharIndex(currCharIndex + 1);
            setMobileInputValue(newInput);
        }
    };

    // ... renderWords ...
    const renderWords = () => {
        return words.map((word, wIdx) => {
            let activeClass = '';
            if (wIdx === currWordIndex) activeClass = 'active-word';
            const isPast = wIdx < currWordIndex;
            let wordColor = 'var(--text-muted)';
            if (isPast) {
                const typed = typedHistory[wIdx] || '';
                if (typed === word) {
                    wordColor = 'var(--text-main)';
                } else {
                    wordColor = '#ff6b6b';
                }
            }

            return (
                <div key={wIdx} className={`word ${activeClass}`} style={{
                    margin: '0 8px 10px 0',
                    display: 'inline-block',
                    opacity: isPast ? 0.7 : 1,
                    position: 'relative',
                    color: isPast ? wordColor : undefined
                }}>
                    {word.split('').map((char, cIdx) => {
                        let charClass = '';
                        let color = 'inherit';
                        if (wIdx === currWordIndex) {
                            color = 'var(--text-muted)';
                            if (cIdx < currCharIndex) {
                                if (currInput[cIdx] === char) {
                                    color = 'var(--text-main)';
                                    charClass = 'correct';
                                } else {
                                    color = '#ff6b6b';
                                    charClass = 'incorrect';
                                }
                            }
                            if (cIdx === currCharIndex) charClass = 'caret';
                        } else if (isPast) {
                            const typed = typedHistory[wIdx] || '';
                            const typedChar = typed[cIdx];
                            if (typedChar === char) color = 'var(--text-main)';
                            else if (typedChar) color = '#ff6b6b';
                            else color = '#8E0E00';
                        }

                        return (
                            <span key={cIdx} className={charClass} style={{
                                color: color,
                                fontSize: '1.5rem',
                                padding: '0 1px',
                                position: 'relative'
                            }}>
                                {char}
                                {charClass === 'caret' && (
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0,
                                        width: '100%',
                                        height: '3px',
                                        background: 'var(--primary-accent)',
                                        animation: 'blink 1s infinite'
                                    }} />
                                )}
                            </span>
                        );
                    })}
                    {/* ... Extra chars ... */}
                </div>
            );
        });
    };

    return (
        <div className="typing-page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            outline: 'none'
        }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={() => inputRef.current && inputRef.current.focus()}
        >
            {/* Desktop hidden input - keeps original behavior */}
            {!isMobile && (
                <input
                    ref={inputRef}
                    type="text"
                    style={{ opacity: 0, position: 'absolute' }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            )}

            {status !== 'finished' ? (
                <>
                    <div style={{
                        marginBottom: '3rem',
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        color: 'var(--primary-accent)',
                        fontWeight: 'bold'
                    }}>
                        {timeLeft}s
                    </div>

                    {!isMobile && (
                        <div style={{ position: 'absolute', top: '2rem', right: '3rem', textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Best Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-accent)' }}>{bestScore} WPM</div>
                        </div>
                    )}

                    {isMobile && (
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Best Score</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-accent)' }}>{bestScore} WPM</div>
                        </div>
                    )}

                    <div style={{
                        padding: '1rem',
                        maxWidth: isMobile ? '100%' : '900px',
                        width: '100%',
                        minHeight: isMobile ? '150px' : '200px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        userSelect: 'none'
                    }}>
                        {renderWords()}
                    </div>

                    {/* Mobile Input - visible only on mobile */}
                    {isMobile && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={mobileInputValue}
                            onChange={handleMobileInput}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            autoFocus
                            placeholder="Tap here to start typing..."
                            className="glass-panel"
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '1rem',
                                fontSize: '1rem',
                                color: 'var(--text-main)',
                                background: 'rgba(255,255,255,0.1)',
                                border: '2px solid var(--primary-accent)',
                                borderRadius: '8px',
                                marginTop: '1.5rem',
                                textAlign: 'center',
                                caretColor: 'var(--primary-accent)'
                            }}
                        />
                    )}

                    <div style={{
                        marginTop: '2rem',
                        color: 'var(--text-muted)',
                        opacity: 0.7,
                        fontSize: isMobile ? '0.85rem' : '1rem'
                    }}>
                        {isMobile ? 'Tap the input field above and start typing' : 'Test starts on first keystroke'}
                    </div>
                </>
            ) : (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    animation: 'fadeIn 0.5s',
                    width: '100%',
                    maxWidth: '1000px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Test Complete</h2>

                    <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{wpm}</div>
                            <div style={{ color: 'var(--text-muted)' }}>WPM</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-accent)' }}>{accuracy}%</div>
                            <div style={{ color: 'var(--text-muted)' }}>Accuracy</div>
                        </div>
                    </div>

                    {/* Current Session Graph */}
                    <div style={{ width: '100%', height: '300px', marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Session Progress</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={liveWpmData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="time" stroke="var(--text-muted)" opacity={0.5} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                                <YAxis stroke="var(--text-muted)" opacity={0.5} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }} />
                                <Line type="monotone" dataKey="wpm" stroke="var(--primary-accent)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Past Sessions Graph (Ghost Mode) */}


                    <button
                        onClick={resetGame}
                        className="glass-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
                    >
                        <FaRedo /> Try Again
                    </button>
                </div>
            )}

            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default TypingPractice;
