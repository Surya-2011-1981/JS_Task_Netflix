// Auth Context - User authentication state management
import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as authService from '../services/firebase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Listen to auth state changes on mount
    useEffect(() => {
        setIsLoading(true);
        let unsubscribe;

        const initAuth = async () => {
            try {
                unsubscribe = await authService.onAuthStateChanged(async (firebaseUser) => {
                    if (firebaseUser) {
                        const currentUser = await authService.getCurrentUser();
                        setUser(currentUser);
                    } else {
                        setUser(null);
                    }
                    setIsLoading(false);
                });
            } catch (err) {
                console.error('Auth initialization error:', err);
                setUser(null);
                setIsLoading(false);
            }
        };

        initAuth();

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const signUp = useCallback(async (email, password) => {
        try {
            setError(null);
            const result = await authService.signUp(email, password);

            if (result.success) {
                setUser(result.user);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Sign up failed';
            setError(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }
    }, []);

    const signIn = useCallback(async (email, password) => {
        try {
            setError(null);
            const result = await authService.signIn(email, password);

            if (result.success) {
                setUser(result.user);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Sign in failed';
            setError(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }
    }, []);

    const signInAsGuest = useCallback(async () => {
        try {
            setError(null);
            const result = await authService.signInAsGuest();

            if (result.success) {
                setUser(result.user);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Guest sign in failed';
            setError(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            setError(null);
            await authService.signOut();
            setUser(null);
            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'Sign out failed';
            setError(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }
    }, []);

    const value = {
        user,
        isLoading,
        error,
        signUp,
        signIn,
        signInAsGuest,
        signOut,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
