import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/Auth/AuthForm';

const Login = () => {
    const navigate = useNavigate();

    return (
        <div className="login-page" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <AuthForm onSuccess={() => navigate('/')} />
        </div>
    );
};

export default Login;
