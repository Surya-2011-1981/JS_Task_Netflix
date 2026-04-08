// Navigation Bar Component
import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import './Navbar.css';

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', path: '/', icon: '🏠' },
        { label: 'TV Shows', path: '/tv-shows', icon: '📺' },
        { label: 'Movies', path: '/movies', icon: '🎬' },
        { label: 'Video Games', path: '/games', icon: '🎮' }
    ];

    const handleNavClick = useCallback((path) => {
        navigate(path);
        setIsMenuOpen(false);
    }, [navigate]);

    const handleProfileClick = useCallback(() => {
        navigate('/profile');
        setIsMenuOpen(false);
    }, [navigate]);

    const handleSearchClick = useCallback(() => {
        navigate('/search');
        setIsMenuOpen(false);
    }, [navigate]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo">
                    <button
                        className="logo-btn"
                        onClick={() => handleNavClick('/')}
                        aria-label="Home"
                    >
                        <span className="logo-text">N</span>
                        <span className="logo-label">etflix</span>
                    </button>
                </div>

                {/* Nav Items - Desktop */}
                <ul className="navbar-items">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <button
                                className={`navbar-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.path)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Right Section */}
                <div className="navbar-right">
                    {/* Search Button */}
                    <button
                        className="navbar-search-btn"
                        onClick={handleSearchClick}
                        aria-label="Search"
                        title="Search"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>

                    {/* Profile/Menu Button */}
                    {isAuthenticated && (
                        <div className="navbar-profile">
                            <button
                                className="navbar-profile-btn"
                                onClick={handleProfileClick}
                                aria-label="Profile"
                                title={user?.displayName || 'Profile'}
                            >
                                <div className="profile-avatar">
                                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`navbar-menu-toggle ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="navbar-mobile-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <button
                        className="mobile-menu-item"
                        onClick={handleProfileClick}
                    >
                        <span className="nav-icon">👤</span>
                        <span>Profile</span>
                    </button>
                </div>
            )}
        </nav>
    );
}
