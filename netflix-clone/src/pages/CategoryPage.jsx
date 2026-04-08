// Category Page - Browse TV Shows, Movies, Games
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMedia, useAsync } from '../hooks';
import * as apiService from '../services/api';
import * as db from '../utils/database';
import { MediaGrid } from '../components/MediaCard';
import { PreviewModal } from '../components/Modal';
import { ListSkeleton } from '../components/Skeleton';
import './Category.css';

const CATEGORY_DETAILS = {
    'tv-shows': {
        title: 'TV Shows',
        icon: '📺',
        category: 'TV Shows'
    },
    'movies': {
        title: 'Movies',
        icon: '🎬',
        category: 'Movies'
    },
    'games': {
        title: 'Video Games',
        icon: '🎮',
        category: 'Games'
    }
};

export function CategoryPage() {
    const { slug } = useParams();
    const { setLoading, allMedia } = useMedia();
    const [categoryMedia, setCategoryMedia] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [watchlist, setWatchlist] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const pageSize = 50;
    const categoryDetails = CATEGORY_DETAILS[slug] || CATEGORY_DETAILS['tv-shows'];

    // Load category media
    const { isLoading } = useAsync(async () => {
        try {
            setLoading(true);

            // Get media by category
            const media = await apiService.getMediaByCategory(categoryDetails.category);
            setCategoryMedia(media);

            // Load watchlist
            const dbWatchlist = await db.getWatchlist();
            setWatchlist(dbWatchlist);

            setLoading(false);
        } catch (error) {
            console.error('Error loading category:', error);
            setLoading(false);
        }
    }, true);

    const handleCardClick = useCallback((media) => {
        setSelectedMedia(media);
        setIsModalOpen(true);
    }, []);

    const handleWatchlistToggle = useCallback(async (mediaId, add) => {
        try {
            if (add) {
                const media = categoryMedia.find((m) => m.id === mediaId);
                if (media) {
                    await db.addToWatchlist(media);
                    setWatchlist((prev) => [...prev, media]);
                }
            } else {
                await db.removeFromWatchlist(mediaId);
                setWatchlist((prev) => prev.filter((m) => m.id !== mediaId));
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        }
    }, [categoryMedia]);

    const isMediaInWatchlist = useCallback((mediaId) => {
        return watchlist.some((m) => m.id === mediaId);
    }, [watchlist]);

    const paginatedMedia = categoryMedia.slice(0, page * pageSize);

    const loadMore = useCallback(() => {
        setPage((prev) => {
            const nextPage = prev + 1;
            setHasMore(nextPage * pageSize < categoryMedia.length);
            return nextPage;
        });
    }, [categoryMedia.length]);

    return (
        <div className="category-page">
            {/* Header */}
            <div className="category-header">
                <h1>
                    <span className="category-icon">{categoryDetails.icon}</span>
                    {categoryDetails.title}
                </h1>
                <p className="category-count">
                    {categoryMedia.length} {categoryMedia.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            {/* Content */}
            <div className="category-container">
                {isLoading ? (
                    <ListSkeleton count={20} />
                ) : (
                    <>
                        <MediaGrid
                            items={paginatedMedia}
                            onCardClick={handleCardClick}
                            onWatchlistToggle={handleWatchlistToggle}
                        />

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="load-more-section">
                                <button className="btn btn-secondary" onClick={loadMore}>
                                    Load More
                                </button>
                            </div>
                        )}

                        {categoryMedia.length === 0 && (
                            <div className="empty-state">
                                <p>No {categoryDetails.title.toLowerCase()} found</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Preview Modal */}
            <PreviewModal
                media={selectedMedia}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onWatchlistToggle={(add) => handleWatchlistToggle(selectedMedia?.id, add)}
                inWatchlist={selectedMedia ? isMediaInWatchlist(selectedMedia.id) : false}
            />
        </div>
    );
}
