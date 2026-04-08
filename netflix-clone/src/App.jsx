// Main App Component - Routing and layout
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import { OfflineProvider } from './context/OfflineContext';
import { useAuth } from './hooks';
import { Navbar } from './components/Navbar';
import { ConnectivityBadge } from './components/ConnectivityBadge';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

// Styles
import './styles/globals.css';

/**
 * Protected Route - Redirects to sign-in if not authenticated
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--background)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid var(--border-color)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 1rem',
                    }} />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

/**
 * AppContent - Main app layout (inside providers)
 */
function AppContent() {
    const { isAuthenticated } = useAuth();

    // Register service worker for offline support
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }, []);

    return (
        <>
            <ConnectivityBadge />

            {isAuthenticated && <Navbar />}

            <main style={{ flex: 1 }}>
                <Routes>
                    {/* Auth Routes */}
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tv-shows"
                        element={
                            <ProtectedRoute>
                                <CategoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/movies"
                        element={
                            <ProtectedRoute>
                                <CategoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/games"
                        element={
                            <ProtectedRoute>
                                <CategoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <SearchPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </>
    );
}

/**
 * App - Root component with all providers
 */
export default function App() {
    return (
        <Router>
            <OfflineProvider>
                <AuthProvider>
                    <MediaProvider>
                        <AppContent />
                    </MediaProvider>
                </AuthProvider>
            </OfflineProvider>
        </Router>
    );
}
