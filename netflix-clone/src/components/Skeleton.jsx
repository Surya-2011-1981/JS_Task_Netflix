// Loading Skeleton Components - Shimmer effect for placeholders

import React from 'react';
import './Skeleton.css';

export function MediaCardSkeleton() {
    return (
        <div className="skeleton media-card-skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-content">
                <div className="skeleton-line skeleton-line-full" />
                <div className="skeleton-line skeleton-line-short" />
            </div>
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="skeleton hero-skeleton">
            <div className="skeleton-hero-image" />
            <div className="skeleton-hero-overlay" />
            <div className="skeleton-hero-content">
                <div className="skeleton-line skeleton-line-full" />
                <div className="skeleton-line skeleton-line-long" />
                <div className="skeleton-line skeleton-line-short" />
            </div>
        </div>
    );
}

export function RowSkeleton() {
    return (
        <div className="skeleton row-skeleton">
            <div className="skeleton-row-title" />
            <div className="skeleton-row-items">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-row-item" />
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 5 }) {
    return (
        <div className="skeleton-list">
            {Array.from({ length: count }).map((_, i) => (
                <MediaCardSkeleton key={i} />
            ))}
        </div>
    );
}
