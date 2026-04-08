// Sign In Page
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import './Auth.css';

export function SignInPage() {
    const navigate = useNavigate();
    const { signIn, signInAsGuest } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setIsLoading(true);

        try {
            const result = await signIn(email, password);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Sign in failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [email, password, signIn, navigate]);

    const handleGuestSignIn = useCallback(async () => {
        setError('');
        setIsLoading(true);

        try {
            const result = await signInAsGuest();

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Guest sign in failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [signInAsGuest, navigate]);

    return (
        <div className="auth-page">
            {/* Background */}
            <div className="auth-background" />

            {/* Content */}
            <div className="auth-container">
                <div className="auth-card">
                    {/* Logo */}
                    <div className="auth-logo">
                        <span className="logo-text">N</span>
                        <span className="logo-label">etflix</span>
                    </div>

                    {/* Title */}
                    <h1 className="auth-title">Sign In</h1>

                    {/* Error Message */}
                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>Or</span>
                    </div>

                    {/* Guest Sign In */}
                    <button
                        className="btn btn-secondary auth-guest-btn"
                        onClick={handleGuestSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Continue as Guest'}
                    </button>

                    {/* Sign Up Link */}
                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={() => navigate('/signup')}
                            disabled={isLoading}
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
