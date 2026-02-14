'use client';

import { useLoginWithEmail, usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

export default function TestLoginPage() {
    const { ready, authenticated, user, logout } = usePrivy();
    const { sendCode, loginWithCode } = useLoginWithEmail({
        onError: (err: string) => console.error('Email login error:', err)
    });

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');

    useEffect(() => {
        console.log('TestLoginPage mounted. Ready:', ready, 'Auth:', authenticated);
    }, [ready, authenticated]);

    const handleSendCode = async () => {
        console.log('Sending code to:', email);
        try {
            await sendCode({ email });
            setStep('code');
        } catch (err) {
            console.error('Send code failed:', err);
            alert('Failed to send code. Check console.');
        }
    };

    const handleLoginWithCode = async () => {
        console.log('Verifying code:', code);
        try {
            await loginWithCode({ code });
        } catch (err) {
            console.error('Login failed:', err);
            alert('Login failed. Check console.');
        }
    };

    return (
        <div style={{ padding: 50, background: '#111', color: '#fff', height: '100vh', fontFamily: 'monospace' }}>
            <h1>Privy Headless Login Test</h1>
            <p>App ID: {process.env.NEXT_PUBLIC_PRIVY_APP_ID}</p>
            <p>Ready: {ready ? 'YES' : 'NO'}</p>
            <p>Auth: {authenticated ? 'YES' : 'NO'}</p>

            {authenticated && (
                <div style={{ marginTop: 20, padding: 20, border: '1px solid green' }}>
                    <p>LOGGED IN AS: {user?.email?.address}</p>
                    <button onClick={logout} style={{ padding: 10, background: 'red', color: 'white' }}>LOGOUT</button>
                </div>
            )}

            {!authenticated && step === 'email' && (
                <div style={{ marginTop: 20 }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: 10, fontSize: 16, width: 300, color: 'black' }}
                    />
                    <button
                        onClick={handleSendCode}
                        disabled={!ready}
                        style={{ padding: 10, marginLeft: 10, fontSize: 16, cursor: 'pointer', background: 'blue', color: 'white' }}
                    >
                        SEND CODE
                    </button>
                </div>
            )}

            {!authenticated && step === 'code' && (
                <div style={{ marginTop: 20 }}>
                    <p>Check email for code!</p>
                    <input
                        type="text"
                        placeholder="Enter code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        style={{ padding: 10, fontSize: 16, width: 150, color: 'black' }}
                    />
                    <button
                        onClick={handleLoginWithCode}
                        style={{ padding: 10, marginLeft: 10, fontSize: 16, cursor: 'pointer', background: 'green', color: 'white' }}
                    >
                        VERIFY & LOGIN
                    </button>
                </div>
            )}
        </div>
    );
}
