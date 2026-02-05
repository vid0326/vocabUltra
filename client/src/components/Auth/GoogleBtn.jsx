import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const GoogleBtn = ({ onSuccess, onError }) => {
    const { googleLogin } = useAuth();

    return (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    const success = await googleLogin(credentialResponse.credential);
                    if (success && onSuccess) onSuccess();
                }}
                onError={() => {
                    if (onError) onError();
                }}
                theme="filled_black"
                shape="pill"
            />
        </div>
    );
};

export default GoogleBtn;
