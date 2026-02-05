import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Quiz = () => {
    const [words, setWords] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(true);

    const isMobile = window.innerWidth <= 480;

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/words');
            setWords(res.data);
            if (res.data.length >= 4) {
                generateQuiz(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateQuiz = (wordList) => {
        
        const quizLength = Math.min(5, wordList.length);
        const shuffled = [...wordList].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, quizLength);

        const generatedQuestions = selected.map(target => {
         
            const others = wordList.filter(w => w._id !== target._id);
            const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);

            const options = [target, ...distractors].sort(() => 0.5 - Math.random());

            return {
                word: target.term,
                correctDefinition: target.definition,
                correctId: target._id,
                options: options.map(o => ({ id: o._id, def: o.definition }))
            };
        });

        setQuestions(generatedQuestions);
    };

    const handleAnswer = async (selectedId) => {
        const isCorrect = selectedId === questions[currentQ].correctId;
        if (isCorrect) setScore(score + 1);


        try {
            await axios.post('http://localhost:5000/api/quiz-result', {
                wordId: questions[currentQ].correctId,
                isCorrect
            });
        } catch (e) { console.error(e); }

        const nextQ = currentQ + 1;
        if (nextQ < questions.length) {
            setCurrentQ(nextQ);
        } else {
            setShowResult(true);
        }
    };

    if (loading) return <div>Loading Quiz...</div>;

    if (words.length < 4) {
        return (
            <div style={{
                padding: isMobile ? '2rem 1rem' : '3rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                opacity: 0.8
            }}>
                <h2 style={{
                    marginBottom: '1rem',
                    color: 'var(--text-main)',
                    fontSize: isMobile ? '1.5rem' : '2rem'
                }}>Not enough words!</h2>
                <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>You need at least 4 words in your dictionary to start a quiz.</p>
                <p style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>Go search and add some words!</p>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="glass-panel" style={{
                padding: isMobile ? '2rem 1rem' : '3rem',
                textAlign: 'center',
                margin: isMobile ? '0 1rem' : '0 auto',
                maxWidth: '800px'
            }}>
                <h2 style={{
                    fontSize: isMobile ? '2rem' : '3rem',
                    marginBottom: isMobile ? '1.5rem' : '2rem'
                }}>Quiz Complete!</h2>
                <p style={{
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    marginBottom: isMobile ? '1.5rem' : '2rem'
                }}>
                    You scored <span style={{ color: '#a18cd1', fontWeight: 'bold' }}>{score}</span> out of {questions.length}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="glass-btn"
                    style={{
                        width: isMobile ? '100%' : 'auto',
                        padding: isMobile ? '12px 24px' : '10px 20px'
                    }}
                >
                    Play Again
                </button>
            </div>
        );
    }

    const question = questions[currentQ];

    return (
        <div className="quiz-container" style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '0 1rem' : '0'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                fontSize: isMobile ? '0.95rem' : '1rem'
            }}>
                <span>Question {currentQ + 1}/{questions.length}</span>
                <span>Score: {score}</span>
            </div>

            <div className="glass-panel" style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: isMobile ? '1.8rem' : '2.5rem',
                    marginBottom: isMobile ? '1.5rem' : '2rem',
                    wordBreak: 'break-word'
                }}>
                    {question.word}
                </h2>

                <div style={{ display: 'grid', gap: isMobile ? '0.75rem' : '1rem' }}>
                    {question.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(opt.id)}
                            className="glass-btn"
                            style={{
                                padding: isMobile ? '1rem' : '1.5rem',
                                textAlign: 'left',
                                fontSize: isMobile ? '0.95rem' : '1.1rem',
                                lineHeight: isMobile ? '1.4' : '1.6',
                                whiteSpace: 'normal',
                                height: 'auto'
                            }}
                        >
                            {opt.def}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
