// Sign Up Page
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import './Auth.css';

export function SignUpPage() {
    const navigate = useNavigate();
    const { signUp, signInAsGuest } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.displayName || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const result = await signUp(formData.email, formData.password);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Sign up failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, signUp, navigate]);

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
                    <h1 className="auth-title">Create Account</h1>

                    {/* Error Message */}
                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="displayName">Full Name</label>
                            <input
                                id="displayName"
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                placeholder="Enter your name"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="At least 6 characters"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
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

                    {/* Sign In Link */}
                    <p className="auth-footer">
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={() => navigate('/signin')}
                            disabled={isLoading}
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
