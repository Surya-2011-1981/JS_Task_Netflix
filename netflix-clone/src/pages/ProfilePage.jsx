// Profile Page - User profile, watchlist, watch history
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAsync } from '../hooks';
import * as db from '../utils/database';
import { MediaGrid } from '../components/MediaCard';
import { PreviewModal } from '../components/Modal';
import { ListSkeleton } from '../components/Skeleton';
import './Profile.css';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [watchHistory, setWatchHistory] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('watchlist');
    const [statsLoading, setstatsLoading] = useState(true);

    // Load user data
    const { isLoading } = useAsync(async () => {
        try {
            setstatsLoading(true);

            const dbWatchlist = await db.getWatchlist();
            const dbHistory = await db.getWatchHistory();

            setWatchlist(dbWatchlist);
            setWatchHistory(dbHistory.filter((h) => h.media_data && h.media_data.title));

            setstatsLoading(false);
        } catch (error) {
            console.error('Error loading profile data:', error);
            setstatsLoading(false);
        }
    }, true);

    const handleSignOut = useCallback(async () => {
        const result = await signOut();
        if (result.success) {
            navigate('/signin');
        }
    }, [signOut, navigate]);

    const handleCardClick = useCallback((media) => {
        setSelectedMedia(media);
        setIsModalOpen(true);
    }, []);

    const handleWatchlistRemove = useCallback(async (mediaId) => {
        try {
            await db.removeFromWatchlist(mediaId);
            setWatchlist((prev) => prev.filter((m) => m.id !== mediaId));
        } catch (error) {
            console.error('Error removing from watchlist:', error);
        }
    }, []);

    if (!user) {
        return (
            <div className="profile-not-authenticated">
                <p>Please sign in to view your profile</p>
                <button className="btn btn-primary" onClick={() => navigate('/signin')}>
                    Sign In
                </button>
            </div>
        );
    }

    const watchlistItems = watchlist.filter((item) => item.title);
    const displayHistory = watchHistory.slice(0, 20).filter((item) => item.media_data?.title);

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {user.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="profile-details">
                            <h1>{user.displayName || 'User'}</h1>
                            <p>{user.email || 'Guest User'}</p>
                        </div>
                    </div>

                    <button className="btn btn-secondary" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>

                {/* Stats */}
                <div className="profile-stats">
                    <div className="stat-card">
                        <span className="stat-value">{watchlistItems.length}</span>
                        <span className="stat-label">In Watchlist</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{displayHistory.length}</span>
                        <span className="stat-label">Watch History</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{user.isAnonymous ? '🎭' : '👤'}</span>
                        <span className="stat-label">{user.isAnonymous ? 'Guest Mode' : 'Signed In'}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('watchlist')}
                    >
                        <span className="tab-icon">📌</span>
                        My Watchlist ({watchlistItems.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className="tab-icon">⏱️</span>
                        Watch History ({displayHistory.length})
                    </button>
                </div>

                {/* Content */}
                <div className="profile-content">
                    {activeTab === 'watchlist' && (
                        <div className="watchlist-section">
                            {statsLoading ? (
                                <ListSkeleton count={12} />
                            ) : watchlistItems.length > 0 ? (
                                <MediaGrid
                                    items={watchlistItems}
                                    onCardClick={handleCardClick}
                                    onWatchlistToggle={(mediaId, add) => {
                                        if (!add) {
                                            handleWatchlistRemove(mediaId);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📌</div>
                                    <h3>Your watchlist is empty</h3>
                                    <p>Add shows and movies to your watchlist to watch later</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/')}
                                    >
                                        Explore Content
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="history-section">
                            {statsLoading ? (
                                <ListSkeleton count={12} />
                            ) : displayHistory.length > 0 ? (
                                <div className="history-list">
                                    {displayHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="history-item"
                                            onClick={() => {
                                                if (item.media_data.title) {
                                                    handleCardClick(item.media_data);
                                                }
                                            }}
                                        >
                                            <img
                                                src={item.media_data?.poster}
                                                alt={item.media_data?.title}
                                                className="history-item-image"
                                            />
                                            <div className="history-item-content">
                                                <h4>{item.media_data?.title}</h4>
                                                <p className="history-item-meta">
                                                    {item.media_data?.releaseYear}
                                                </p>
                                                <p className="history-item-time">
                                                    {new Date(item.watched_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">⏱️</div>
                                    <h3>No watch history yet</h3>
                                    <p>Start watching shows and movies to see your history</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/')}
                                    >
                                        Start Watching
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            <PreviewModal
                media={selectedMedia}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                inWatchlist={selectedMedia ? watchlistItems.some((m) => m.id === selectedMedia.id) : false}
                onWatchlistToggle={(add) => {
                    if (!add && selectedMedia) {
                        handleWatchlistRemove(selectedMedia.id);
                    }
                }}
            />
        </div>
    );
}
