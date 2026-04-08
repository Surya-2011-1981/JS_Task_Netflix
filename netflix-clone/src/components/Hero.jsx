// Hero Banner Component - Featured media showcase
import React, { useCallback } from 'react';
import './Hero.css';

export function Hero({ media, onPlayClick, onMoreInfoClick }) {
    if (!media) {
        return null;
    }

    const handlePlayClick = useCallback(() => {
        if (onPlayClick) {
            onPlayClick(media);
        }
    }, [media, onPlayClick]);

    const handleMoreInfoClick = useCallback(() => {
        if (onMoreInfoClick) {
            onMoreInfoClick(media);
        }
    }, [media, onMoreInfoClick]);

    return (
        <div
            className="hero"
            style={{
                backgroundImage: `url('${media.banner}')`
            }}
        >
            {/* Background overlay */}
            <div className="hero-overlay" />

            {/* Content */}
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">{media.title}</h1>

                    <p className="hero-description">{media.description}</p>

                    {/* Meta Info */}
                    <div className="hero-meta">
                        <span className="meta-item">
                            <span className="meta-label">Rating:</span>
                            <span className="meta-value">★ {media.rating}</span>
                        </span>
                        <span className="meta-item">
                            <span className="meta-label">Released:</span>
                            <span className="meta-value">{media.releaseYear}</span>
                        </span>
                        <span className="meta-item">
                            <span className="meta-label">Genre:</span>
                            <span className="meta-value">{media.genre}</span>
                        </span>
                        <span className="meta-item">
                            <span className="meta-label">Duration:</span>
                            <span className="meta-value">{media.duration}</span>
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="hero-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handlePlayClick}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            Play Now
                        </button>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={handleMoreInfoClick}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            More Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
