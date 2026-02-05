import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dictionary from './pages/Dictionary';
import MyWords from './pages/MyWords';
import Quiz from './pages/Quiz';

import { Toaster } from 'react-hot-toast';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Notes from './pages/Notes';
import TypingPractice from './pages/TypingPractice';

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="app-container">
              <Toaster position="top-center" />
              <Navbar />
              <div className="container" style={{ marginTop: '2rem' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dictionary" element={<Dictionary />} />
                  <Route path="/my-words" element={<MyWords />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/typing" element={<TypingPractice />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                </Routes>
              </div>
              <ThemeSwitcher />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
