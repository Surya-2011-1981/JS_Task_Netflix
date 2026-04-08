// Preview Modal Component - Media details preview
import React, { useCallback, useEffect } from 'react';
import './Modal.css';

export function PreviewModal({
    media,
    isOpen,
    onClose,
    onWatchlistToggle,
    inWatchlist = false
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    const handleWatchlistClick = useCallback(() => {
        if (onWatchlistToggle) {
            onWatchlistToggle(!inWatchlist);
        }
    }, [inWatchlist, onWatchlistToggle]);

    if (!isOpen || !media) {
        return null;
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container modal-preview">
                {/* Close Button */}
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Banner Image */}
                <div className="modal-banner">
                    <img
                        src={media.banner}
                        alt={media.title}
                        className="modal-banner-image"
                    />
                    <div className="modal-banner-overlay" />
                </div>

                {/* Content */}
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                        <div className="modal-title-section">
                            <h2 className="modal-title">{media.title}</h2>
                            <div className="modal-meta">
                                <span className="badge">{media.category}</span>
                                <span className="badge badge-rating">★ {media.rating}</span>
                                <span className="badge">{media.releaseYear}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button className="btn btn-primary">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Play
                            </button>
                            <button
                                className={`btn btn-secondary modal-watchlist-btn ${inWatchlist ? 'active' : ''}`}
                                onClick={handleWatchlistClick}
                                title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <polyline points="20 1 24 5 20 9"></polyline>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4"></path>
                                </svg>
                                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
                            </button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="modal-details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Genre</span>
                            <span className="detail-value">{media.genre}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Runtime</span>
                            <span className="detail-value">{media.duration}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Country</span>
                            <span className="detail-value">{media.country}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Votes</span>
                            <span className="detail-value">{media.votes?.toLocaleString() || '0'}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="modal-description">
                        <h3>Overview</h3>
                        <p>{media.description}</p>
                    </div>

                    {/* Cast/Crew Info (placeholder) */}
                    <div className="modal-section">
                        <h3>Featured In</h3>
                        <div className="featured-tags">
                            {[media.genre, media.category, `${media.releaseYear}s`].map((tag) => (
                                <span key={tag} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
