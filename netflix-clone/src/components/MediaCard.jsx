// Media Card Component - Reusable card for media items
import React, { useCallback, useRef } from 'react';
import { useIntersectionObserver } from '../hooks';
import './MediaCard.css';

export function MediaCard({
    id,
    title,
    poster,
    rating,
    category,
    onCardClick,
    inWatchlist = false,
    onWatchlistToggle
}) {
    const cardRef = useRef(null);
    const imageRef = useRef(null);
    const isVisible = useIntersectionObserver(imageRef);

    const handleCardClick = useCallback(() => {
        if (onCardClick) {
            onCardClick({ id, title, poster, rating, category });
        }
    }, [id, title, poster, rating, category, onCardClick]);

    const handleWatchlistClick = useCallback((e) => {
        e.stopPropagation();
        if (onWatchlistToggle) {
            onWatchlistToggle(id, !inWatchlist);
        }
    }, [id, inWatchlist, onWatchlistToggle]);

    return (
        <div
            ref={cardRef}
            className="media-card"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick();
                }
            }}
        >
            <div className="media-card-image-wrapper">
                {/* Lazy load image */}
                {isVisible ? (
                    <img
                        ref={imageRef}
                        src={poster}
                        alt={title}
                        className="media-card-image"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="media-card-image-placeholder" />
                )}

                {/* Overlay */}
                <div className="media-card-overlay">
                    <div className="media-card-content">
                        <h3 className="media-card-title">{title}</h3>
                        {rating && (
                            <div className="media-card-rating">
                                <span className="rating-star">★</span>
                                <span>{rating}</span>
                            </div>
                        )}
                        {category && <span className="media-card-category">{category}</span>}
                    </div>

                    {/* Watchlist button */}
                    <button
                        className={`media-card-watchlist-btn ${inWatchlist ? 'active' : ''}`}
                        onClick={handleWatchlistClick}
                        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                        aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                        <svg
                            className="watchlist-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="20 1 24 5 20 9"></polyline>
                            <path d="M3 11V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Media Grid Component - Display multiple media cards
 */
export function MediaGrid({ items = [], isLoading = false, onCardClick, onWatchlistToggle }) {
    if (isLoading) {
        return (
            <div className="media-grid loading">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="media-card skeleton-placeholder" />
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="media-grid-empty">
                <div className="empty-state">
                    <p>No content found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="media-grid">
            {items.map((item) => (
                <MediaCard
                    key={item.id}
                    {...item}
                    onCardClick={onCardClick}
                    onWatchlistToggle={onWatchlistToggle}
                />
            ))}
        </div>
    );
}
